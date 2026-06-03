"""
data_tools.py — curated data-retrieval tools for the student-assistance chatbot.

Phase 1A: shared query infrastructure (constants, helpers, builders).
Phase 1B: the curated tool functions the LLM will call.

The LLM NEVER writes queries — it only calls these functions with parameters.
Every safety rule (test-entity exclusion, status filters, result caps, PII
stripping, query timeouts) is enforced here, in code you control.

Every tool returns:  {"summary": str, "results": list, "count": int}

25 tools:
  search_programs · get_program_details · search_universities ·
  get_university_details · search_scholarships · get_open_admissions ·
  get_admission_programs · get_fee_structure · get_campus_info ·
  list_majors · search_academic_departments · get_my_applications ·
  get_my_scholarship_applications · get_my_profile · get_my_profile_status ·
  search_courses · get_blog_posts · get_my_conversations · get_my_messages ·
  get_my_notifications · get_my_external_applications ·
  search_organizations · browse_program_templates · get_legal_documents ·
  list_countries · check_payment_status

Test:  python data_tools.py
"""

import asyncio
import functools
import logging
import os
import re
import time
from datetime import date, datetime
from bson import ObjectId
from bson.decimal128 import Decimal128
from motor.motor_asyncio import AsyncIOMotorClient

# ============================================================
# DB connection + logging
# ============================================================
# Migration: platform data uses the main ScholarBee MongoDB connection
# injected by NestJS (MONGODB_URI + MONGODB_DB). KB embeddings stay on a
# separate Atlas cluster — see kb_tools.py (CHATBOT_KB_MONGODB_*).
_MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
_MONGODB_DB = os.environ.get("MONGODB_DB", "test")

client = AsyncIOMotorClient(_MONGODB_URI)
db = client[_MONGODB_DB]

logger = logging.getLogger("chatbot.tools")
logger.info("chatbot data layer using platform database %r", _MONGODB_DB)


# ============================================================
# PHASE 1A — shared query infrastructure
# ============================================================

DEFAULT_LIMIT = 10
MAX_LIMIT     = 25
MAX_COURSES   = 15           # cap course arrays so tool payloads stay small
MIN_SEARCH_LEN = 2           # reject 1-char regex (dangerous broad scans)
TOOL_TIMEOUT  = 8            # seconds — a single tool call may never exceed this
NOT_TEST      = {"$ne": True} # is_test_entity guard (field is often absent on real docs)


def tool(fn):
    """Decorator applied to every tool: enforces a hard timeout and logs
    name / args / result count / latency."""
    @functools.wraps(fn)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = await asyncio.wait_for(fn(*args, **kwargs),
                                            timeout=TOOL_TIMEOUT)
        except asyncio.TimeoutError:
            result = response(
                "The lookup took too long — please try a narrower search.", [])
        except Exception as exc:
            logger.exception("tool=%s failed: %s", fn.__name__, exc)
            result = response("Something went wrong fetching that data.", [])
        ms = (time.perf_counter() - start) * 1000
        logger.info("tool=%s kwargs=%s count=%s latency_ms=%.0f",
                    fn.__name__, kwargs, result.get("count"), ms)
        return result
    return wrapper


def _ci(value):
    """Case-insensitive partial match. Returns None for empty / too-short
    input so the caller can safely skip the filter."""
    if not value:
        return None
    value = str(value).strip()
    if len(value) < MIN_SEARCH_LEN:
        return None
    return {"$regex": re.escape(value), "$options": "i"}


_NAME_STOPWORDS = {
    "of", "the", "for", "and", "in", "at", "a",
    "university", "universities", "college", "institute",
    "department", "campus", "school",
}


def _tokens(value):
    """Split a search phrase into distinctive lowercase tokens."""
    raw  = re.findall(r"[A-Za-z0-9&]+", str(value or "").lower())
    toks = [t for t in raw if len(t) >= 2 and t not in _NAME_STOPWORDS]
    return toks or [t for t in raw if len(t) >= 2]


def _name_match(value, fields):
    """$match accepting a document if ANY of `fields` contains ANY
    distinctive token of `value`."""
    if not value or not str(value).strip():
        return None
    toks = _tokens(value)
    if not toks:
        return None
    ors = []
    for tok in toks:
        rx = {"$regex": re.escape(tok), "$options": "i"}
        ors.extend({f: rx} for f in fields)
    return {"$or": ors}


def _name_score(value, fields):
    """Aggregation expression: token-overlap score for ranking."""
    toks = _tokens(value) if value else []
    if not toks:
        return {"$literal": 0}
    per_token = []
    for tok in toks:
        rx     = re.escape(tok)
        checks = [{"$regexMatch": {"input": {"$ifNull": [f"${f}", ""]},
                                   "regex": rx, "options": "i"}}
                  for f in fields]
        per_token.append({"$cond": [{"$or": checks}, 1, 0]})
    return {"$add": per_token} if len(per_token) > 1 else per_token[0]


def _degree_match(value):
    """Tolerant degree-level filter."""
    if not value or not str(value).strip():
        return None
    toks = set(re.findall(r"[a-z]+", str(value).lower()))
    if toks & {"bachelor", "bachelors", "bs", "bsc", "undergraduate", "undergrad"}:
        return {"$regex": "bachelor", "$options": "i"}
    if toks & {"master", "masters", "ms", "msc", "mphil", "mba", "postgraduate"}:
        return {"$regex": "master", "$options": "i"}
    if toks & {"phd", "doctorate", "doctoral"}:
        return {"$regex": "phd|doctora", "$options": "i"}
    if toks & {"associate", "associates"}:
        return {"$regex": "associate", "$options": "i"}
    if toks & {"diploma"}:
        return {"$regex": "diploma", "$options": "i"}
    if toks & {"intermediate"}:
        return {"$regex": "intermediate", "$options": "i"}
    return _ci(value)


def _clamp(limit):
    try:
        return max(1, min(int(limit), MAX_LIMIT))
    except (TypeError, ValueError):
        return DEFAULT_LIMIT


def _oid(value):
    try:
        return ObjectId(str(value))
    except Exception:
        return None


def serialize(value):
    """Recursively convert ObjectId / Decimal128 / datetime → JSON-safe types."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, Decimal128):
        return float(value.to_decimal())
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    return value


def response(summary, results):
    return {"summary": summary,
            "results": serialize(results),
            "count":   len(results)}


def listing(noun, results):
    if results:
        return response(f"Found {len(results)} {noun}.", results)
    return response(f"No matching {noun} found.", results)


def join(from_collection, local_field, as_field,
         foreign_field="_id", preserve=True):
    return [
        {"$lookup": {"from": from_collection, "localField": local_field,
                     "foreignField": foreign_field, "as": as_field}},
        {"$unwind": {"path": f"${as_field}",
                     "preserveNullAndEmptyArrays": preserve}},
    ]


def status_is(field, allowed):
    return {"$expr": {"$in": [
        {"$toLower": {"$ifNull": [f"${field}", ""]}},
        [str(s).lower() for s in allowed],
    ]}}


# ============================================================
# PHASE 1B — curated tool functions
# ============================================================

# --- TOOL 1: search_programs -------------------------------------------------
@tool
async def search_programs(*, major=None, degree_level=None, mode_of_study=None,
                          city=None, max_tuition=None, university_id=None,
                          campus_id=None, sort_by="relevance",
                          limit=DEFAULT_LIMIT):
    """Find programs by major / degree level / mode of study / city / max
    tuition, and/or restricted to one university or campus.

    sort_by: 'relevance' (default), 'fee_low' (cheapest first), or
    'fee_high' (most expensive first).
    """
    pipeline = []

    prog_match = {}
    if (m := _ci(major)):              prog_match["major"] = m
    if (m := _degree_match(degree_level)): prog_match["degree_level"] = m
    if (m := _ci(mode_of_study)):      prog_match["mode_of_study"] = m
    if campus_id:
        oid = _oid(campus_id)
        if oid is None:
            return response("Invalid campus ID.", [])
        prog_match["campus_id"] = oid
    if prog_match:
        pipeline.append({"$match": prog_match})

    # Exclude soft-deleted programs
    pipeline.append({"$match": {"_deleted": {"$ne": True}}})

    pipeline += join("campuses", "campus_id", "campus", preserve=False)
    pipeline.append({"$match": {"campus.is_test_entity": NOT_TEST}})

    if university_id:
        oid = _oid(university_id)
        if oid is None:
            return response("Invalid university ID.", [])
        pipeline.append({"$match": {"campus.university_id": oid}})

    pipeline += join("universities", "campus.university_id", "university")
    pipeline.append({"$match": {"university.is_test_entity": NOT_TEST}})

    pipeline += join("addresses", "campus.address_id", "address")
    if (m := _ci(city)):
        pipeline.append({"$match": {"address.city": m}})

    pipeline += join("fee_structures", "fee_structure", "fee")
    pipeline.append({"$addFields": {"tuition_num": {"$convert": {
        "input": "$fee.tuition_fee", "to": "double",
        "onError": None, "onNull": None}}}})
    if max_tuition is not None:
        pipeline.append({"$match": {"tuition_num": {"$ne": None,
                                                    "$lte": float(max_tuition)}}})

    sorts = {
        "relevance": {"sorting_weight": -1, "name": 1},
        "fee_low":   {"tuition_num": 1, "name": 1},
        "fee_high":  {"tuition_num": -1, "name": 1},
    }
    sort_key = sort_by if sort_by in sorts else "relevance"
    if sort_key in ("fee_low", "fee_high"):
        pipeline.append({"$match": {"tuition_num": {"$ne": None}}})

    pipeline += [
        {"$sort": sorts[sort_key]},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "program_id":              {"$toString": "$_id"},
            "name":                    1,
            "major":                   1,
            "degree_level":            1,
            "mode_of_study":           1,
            "duration":                1,
            "credit_hours":            1,
            # ── new fields ──
            "intake_periods":          1,
            "language_of_instruction": 1,
            "accreditations":          1,
            "scholarship_options":     1,
            # ── joined ──
            "university":              "$university.name",
            "campus":                  "$campus.name",
            "city":                    "$address.city",
            "tuition_fee":             "$tuition_num",
            "currency":                "$fee.currency",
            "application_fee":         "$fee.application_fee",
            "slug":                    1,
        }},
    ]
    rows = await db.programs.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("programs", rows)


# --- TOOL 2: get_program_details --------------------------------------------
@tool
async def get_program_details(program_id):
    """Full detail for one program: info, fee structure, and its courses."""
    oid = _oid(program_id)
    if oid is None:
        return response("Invalid program ID.", [])

    # Guard: exclude soft-deleted programs
    pipeline = [{"$match": {"_id": oid, "_deleted": {"$ne": True}}}]
    pipeline += join("campuses", "campus_id", "campus", preserve=False)
    pipeline.append({"$match": {"campus.is_test_entity": NOT_TEST}})
    pipeline += join("universities", "campus.university_id", "university")
    pipeline.append({"$match": {"university.is_test_entity": NOT_TEST}})
    pipeline += join("addresses", "campus.address_id", "address")
    pipeline += join("fee_structures", "fee_structure", "fee")
    pipeline.append({"$lookup": {
        "from": "courses",
        "let":  {"pid": "$_id"},
        "pipeline": [
            {"$match": {"$expr": {"$or": [
                {"$eq": ["$program_id", "$$pid"]},
                {"$eq": ["$program_id", {"$toString": "$$pid"}]},
            ]}}},
        ],
        "as": "courses",
    }})
    pipeline += [
        {"$limit": 1},
        {"$project": {
            "_id": 0,
            "program_id":              {"$toString": "$_id"},
            "name":                    1,
            "major":                   1,
            "degree_level":            1,
            "mode_of_study":           1,
            "duration":                1,
            "credit_hours":            1,
            "intake_periods":          1,
            "language_of_instruction": 1,
            "accreditations":          1,
            "scholarship_options":     1,
            "university":              "$university.name",
            "campus":                  "$campus.name",
            "city":                    "$address.city",
            "fee": {
                "currency":             "$fee.currency",
                "tuition_fee":          "$fee.tuition_fee",
                "application_fee":      "$fee.application_fee",
                "total_semesters":      "$fee.total_semesters",
                "payment_schedule":     "$fee.payment_schedule",
                "first_semester_total": "$fee._preview_first_semester_total",
                "regular_semester_total": "$fee._preview_regular_semester_total",
                "last_semester_total":  "$fee._preview_last_semester_total",
            },
            "course_count": {"$size": {"$ifNull": ["$courses", []]}},
            "courses": {"$map": {
                "input": {"$slice": [{"$ifNull": ["$courses", []]}, MAX_COURSES]},
                "as":    "c",
                "in":    {"name":        "$$c.course_name",
                          "duration":    "$$c.course_duration",
                          "description": "$$c.course_description",
                          "fee":         "$$c.course_fee"}}},
        }},
    ]
    rows = await db.programs.aggregate(pipeline).to_list(length=1)
    if not rows:
        return response("No program found with that ID.", [])
    return response(f"Details for {rows[0].get('name') or 'the program'}.", rows)


# --- TOOL 3: search_universities --------------------------------------------
@tool
async def search_universities(*, name=None, city=None, type=None,
                              limit=DEFAULT_LIMIT):
    """Find universities by name or abbreviation, city, and/or type."""
    uni_match = {"is_test_entity": NOT_TEST}
    if (m := _ci(type)):
        uni_match["type"] = m

    name_fields = ["name", "abbreviation"]
    if (nf := _name_match(name, name_fields)):
        uni_match["$or"] = nf["$or"]

    pipeline = [{"$match": uni_match}]
    pipeline += join("addresses", "address_id", "address")
    if (m := _ci(city)):
        pipeline.append({"$match": {"address.city": m}})
    pipeline += [
        {"$addFields": {
            "name_score": _name_score(name, name_fields),
            "rank_sort":  {"$convert": {"input": "$ranking", "to": "int",
                                        "onError": 10 ** 9, "onNull": 10 ** 9}},
        }},
        {"$sort": {"name_score": -1, "rank_sort": 1, "name": 1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "university_id": {"$toString": "$_id"},
            "name": 1, "abbreviation": 1, "type": 1, "ranking": 1,
            "city":    "$address.city",
            "website": 1, "slug": 1,
            "logo_url": 1,
            "allow_in_app_applications":  1,
            "allow_external_application": 1,
        }},
    ]
    rows = await db.universities.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("universities", rows)


# --- TOOL 4: get_university_details -----------------------------------------
@tool
async def get_university_details(university_id):
    """Full detail for one university, including a list of its campuses."""
    oid = _oid(university_id)
    if oid is None:
        return response("Invalid university ID.", [])

    pipeline = [{"$match": {"_id": oid, "is_test_entity": NOT_TEST}}]
    pipeline += join("addresses", "address_id", "address")
    pipeline += [
        {"$lookup": {"from": "campuses", "localField": "_id",
                     "foreignField": "university_id", "as": "all_campuses"}},
        {"$addFields": {"real_campuses": {"$filter": {
            "input": {"$ifNull": ["$all_campuses", []]}, "as": "c",
            "cond": {"$ne": ["$$c.is_test_entity", True]}}}}},
        {"$limit": 1},
        {"$project": {
            "_id": 0,
            "university_id":   {"$toString": "$_id"},
            "name":            1,
            "abbreviation":    1,
            "description":     1,
            "type":            1,
            "ranking":         1,
            "founded":         1,
            "website":         1,
            "motto":           1,
            "accreditations":  1,
            "affiliations":    1,
            "languages":       1,
            "total_students":  1,
            "total_faculty":   1,
            # ── new fields ──
            "total_alumni":    1,
            "annual_budget":   1,
            "endowment":       1,
            "campus_size":     1,
            "colors":          1,
            "mascot":          1,
            "notable_alumni":  1,
            "research_output": 1,
            "logo_url":        1,
            # ── application flags ──
            "allow_in_app_applications":  1,
            "allow_external_application": 1,
            # ── location ──
            "city":            "$address.city",
            # ── campuses ──
            "campus_count": {"$size": "$real_campuses"},
            "campuses": {"$map": {
                "input": {"$slice": ["$real_campuses", MAX_LIMIT]},
                "as":    "c",
                "in":    {"campus_id":   {"$toString": "$$c._id"},
                          "name":        "$$c.name",
                          "campus_type": "$$c.campus_type",
                          "level":       "$$c.level",
                          "is_primary":  "$$c.is_primary",
                          "is_partner":  "$$c.is_partner"}}},
            "slug": 1,
        }},
    ]
    rows = await db.universities.aggregate(pipeline).to_list(length=1)
    if not rows:
        return response("No university found with that ID.", [])
    return response(f"Details for {rows[0].get('name') or 'the university'}.", rows)


# --- TOOL 5: search_scholarships --------------------------------------------
@tool
async def search_scholarships(*, degree_level=None, country=None,
                              scholarship_type=None, major=None,
                              status=None, limit=DEFAULT_LIMIT):
    """Find scholarships by degree level / country / type / major.
    Optionally filter by `status` ('closed', 'active', …).
    """
    pipeline = []
    if status:
        pipeline.append({"$match": status_is("status", [status])})

    sub = {}
    if (m := _degree_match(degree_level)): sub["degree_level"] = m
    if (m := _ci(scholarship_type)):       sub["scholarship_type"] = m
    if (m := _ci(major)):                  sub["major"] = m
    if sub:
        pipeline.append({"$match": sub})

    pipeline.append({"$lookup": {
        "from": "countries",
        "let":  {"cid": "$country"},
        "pipeline": [
            {"$match": {"$expr": {"$or": [
                {"$eq": ["$_id", "$$cid"]},
                {"$eq": [{"$toString": "$_id"}, "$$cid"]},
            ]}}},
        ],
        "as": "country_doc",
    }})
    pipeline.append({"$unwind": {"path": "$country_doc",
                                 "preserveNullAndEmptyArrays": True}})
    if (m := _ci(country)):
        pipeline.append({"$match": {"country_doc.name": m}})

    pipeline += [
        {"$sort": {"application_deadline": -1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "scholarship_id":           {"$toString": "$_id"},
            "name":                     "$scholarship_name",
            "type":                     "$scholarship_type",
            "status":                   1,
            "degree_level":             1,
            "amount":                   1,
            "country":                  "$country_doc.name",
            "location":                 1,
            "application_deadline":     1,
            "application_opening_date": 1,
            "application_link":         1,
            "eligibility_criteria":     1,
            "required_documents":       1,
            # ── new fields ──
            "scholarship_description":  1,
            "application_process":      1,
            "rating":                   1,
            "image_url":                1,
        }},
    ]
    rows = await db.scholarships.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("scholarships", rows)


# --- TOOL 6: get_open_admissions --------------------------------------------
@tool
async def get_open_admissions(*, university_id=None, city=None,
                              status=None, limit=DEFAULT_LIMIT):
    """List admissions, optionally for one university or city.
    Optionally filter by `status` (e.g. 'published').
    """
    pipeline = []
    if status:
        pipeline.append({"$match": status_is("status", [status])})

    if university_id:
        oid = _oid(university_id)
        if oid is None:
            return response("Invalid university ID.", [])
        pipeline.append({"$match": {"university_id": oid}})

    pipeline += join("universities", "university_id", "university")
    pipeline.append({"$match": {"university.is_test_entity": NOT_TEST}})
    pipeline += join("campuses", "campus_id", "campus")
    pipeline += join("addresses", "campus.address_id", "address")
    if (m := _ci(city)):
        pipeline.append({"$match": {"address.city": m}})

    pipeline += [
        {"$sort": {"admission_deadline": -1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "admission_id":            {"$toString": "$_id"},
            "title":                   "$admission_title",
            "description":             "$admission_description",
            "deadline":                "$admission_deadline",
            "start_date":              "$admission_startdate",
            "available_seats":         1,
            "status":                  1,
            # ── new fields ──
            "session_term":            1,
            "session_year":            1,
            "receiving_applications":  1,
            "poster":                  1,
            "admission_announcements": 1,
            # ── joined ──
            "university":              "$university.name",
            "campus":                  "$campus.name",
            "city":                    "$address.city",
        }},
    ]
    rows = await db.admissions.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("admissions", rows)


# --- TOOL 7: get_admission_programs -----------------------------------------
@tool
async def get_admission_programs(*, program_id=None, admission_id=None):
    """List admission entries — which specific programs are accepting
    applications, with requirements, fee, seats, and the apply link.
    """
    match = {}
    if program_id:
        oid = _oid(program_id)
        if oid is None:
            return response("Invalid program ID.", [])
        match["program"] = oid
    if admission_id:
        oid = _oid(admission_id)
        if oid is None:
            return response("Invalid admission ID.", [])
        match["admission"] = oid
    if not match:
        return response("Provide a program ID or an admission ID.", [])

    pipeline = [{"$match": match}]
    pipeline += join("programs",   "program",   "program",   preserve=False)
    pipeline += join("campuses",   "program.campus_id", "campus", preserve=False)
    pipeline.append({"$match": {"campus.is_test_entity": NOT_TEST}})
    pipeline += join("admissions", "admission", "admission")
    pipeline += [
        {"$sort": {"receiving_applications": -1}},
        {"$limit": MAX_LIMIT},
        {"$project": {
            "_id": 0,
            "admission_program_id":  {"$toString": "$_id"},
            "program":               "$program.name",
            "degree_level":          "$program.degree_level",
            "admission_title":       "$admission.admission_title",
            "admission_deadline":    "$admission.admission_deadline",
            "admission_status":      "$admission.status",
            "receiving_applications": 1,
            "admission_fee":         1,
            "admission_requirements": 1,
            "available_seats":       1,
            "redirect_deeplink":     1,
            # ── new fields ──
            "status":                1,
            "slug":                  1,
        }},
    ]
    rows = await db.admission_programs.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("admission entries", rows)


# --- TOOL 8: get_fee_structure ----------------------------------------------
@tool
async def get_fee_structure(program_id):
    """Fee breakdown for one program."""
    oid = _oid(program_id)
    if oid is None:
        return response("Invalid program ID.", [])

    doc = await db.fee_structures.find_one(
        {"program_id": {"$in": [oid, str(oid)]}})
    if not doc:
        prog = await db.programs.find_one({"_id": oid}, {"fee_structure": 1})
        if prog and prog.get("fee_structure"):
            doc = await db.fee_structures.find_one({"_id": prog["fee_structure"]})
    if not doc:
        return response("No fee structure found for that program.", [])

    clean = {
        "program_id":              str(program_id),
        "title":                   doc.get("title"),
        "currency":                doc.get("currency"),
        "tuition_fee":             doc.get("tuition_fee"),
        "application_fee":         doc.get("application_fee"),
        "total_semesters":         doc.get("total_semesters"),
        "payment_schedule":        doc.get("payment_schedule"),
        "fees":                    doc.get("fees"),
        "other_fees":              doc.get("other_fees"),
        "first_semester_total":    doc.get("_preview_first_semester_total"),
        "regular_semester_total":  doc.get("_preview_regular_semester_total"),
        "last_semester_total":     doc.get("_preview_last_semester_total"),
    }
    return response("Fee structure retrieved.", [clean])


# --- TOOL 9: get_campus_info ------------------------------------------------
@tool
async def get_campus_info(campus_id):
    """Full detail for one campus: contact, facilities, location, pictures."""
    oid = _oid(campus_id)
    if oid is None:
        return response("Invalid campus ID.", [])

    pipeline = [{"$match": {"_id": oid, "is_test_entity": NOT_TEST}}]
    pipeline += join("universities", "university_id", "university")
    pipeline += join("addresses",    "address_id",    "address")
    pipeline += [
        {"$limit": 1},
        {"$project": {
            "_id": 0,
            "campus_id":   {"$toString": "$_id"},
            "name":        1,
            "campus_type": 1,
            "level":       1,
            # ── contact ──
            "contact_email": 1,
            "contact_phone": 1,
            "website":       1,
            # ── identity / status ──
            "logo_url":           1,
            "slug":               1,
            "is_primary":         1,
            "is_partner":         1,
            "scholarbee_verified": 1,
            "accreditations":     1,
            "established_date":   1,
            # ── location ──
            "latitude":    1,
            "longitude":   1,
            "city":        "$address.city",
            # ── facilities (boolean flags) ──
            "facilities":            1,
            "library_facilities":    1,
            "sports_facilities":     1,
            "residential_facilities": 1,
            "transportation_options": 1,
            "dining_options":        1,
            "healthcare_facilities": 1,
            "parking_facilities":    1,
            "security_features":     1,
            # ── people ──
            "student_population": 1,
            "faculty_count":      1,
            # ── media ──
            "pictures": 1,
            # ── university ──
            "university": "$university.name",
        }},
    ]
    rows = await db.campuses.aggregate(pipeline).to_list(length=1)
    if not rows:
        return response("No campus found with that ID.", [])
    return response(
        f"Campus information for {rows[0].get('name') or 'the campus'}.", rows)


# --- TOOL 10: list_majors ---------------------------------------------------
@tool
async def list_majors(*, university_id=None, campus_id=None, degree_level=None):
    """List distinct majors available, with a count of programs for each."""
    pipeline = []

    prog_match = {"_deleted": {"$ne": True}}
    if (m := _degree_match(degree_level)):
        prog_match["degree_level"] = m
    if campus_id:
        oid = _oid(campus_id)
        if oid is None:
            return response("Invalid campus ID.", [])
        prog_match["campus_id"] = oid
    pipeline.append({"$match": prog_match})

    pipeline += join("campuses", "campus_id", "campus", preserve=False)
    pipeline.append({"$match": {"campus.is_test_entity": NOT_TEST}})
    if university_id:
        oid = _oid(university_id)
        if oid is None:
            return response("Invalid university ID.", [])
        pipeline.append({"$match": {"campus.university_id": oid}})

    pipeline += [
        {"$group": {"_id":           {"$ifNull": ["$major", "Unspecified"]},
                    "program_count": {"$sum": 1}}},
        {"$sort":    {"program_count": -1, "_id": 1}},
        {"$project": {"_id": 0, "major": "$_id", "program_count": 1}},
    ]
    rows = await db.programs.aggregate(pipeline).to_list(length=200)
    return listing("majors", rows)


# --- TOOL 11: get_my_applications  (PERSONAL — SCOPED) ----------------------
@tool
async def get_my_applications(student_id):
    """Program applications belonging to ONE student.

    SECURITY: student_id MUST come from the verified session token — never
    from the LLM, the chat message, or any user input.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    pipeline = [{"$match": {"$or": [{"applicant": oid},
                                    {"student_id": str(oid)}]}}]
    pipeline += join("programs", "program", "program_doc")
    pipeline += join("campuses", "campus_id", "campus")
    pipeline.append({"$lookup": {
        "from": "payments", "localField": "_id",
        "foreignField": "applicationId", "as": "payments"}})
    pipeline += [
        {"$sort": {"submission_date": -1}},
        {"$project": {
            "_id": 0,
            "application_id":     {"$toString": "$_id"},
            "status":             1,
            "submission_date":    1,
            "total_processing_fee": 1,
            "program":            "$program_doc.name",
            "degree_level":       "$program_doc.degree_level",
            "campus":             "$campus.name",
            "payment": {"$map": {
                "input": "$payments", "as": "p",
                "in":    {"verified":     "$$p.paymentVerified",
                          "amount":       "$$p.depositAmount",
                          "deposit_date": "$$p.depositDate",
                          "bank":         "$$p.bankName",
                          "invoice_url":  "$$p.feeInvoiceUrl"}}},
            # applicant_snapshot is deliberately NOT projected — holds PII.
        }},
    ]
    rows = await db.applications.aggregate(pipeline).to_list(length=MAX_LIMIT)
    if rows:
        return response(f"You have {len(rows)} program application(s).", rows)
    return response("You don't have any program applications yet.", rows)


# --- TOOL 12: get_my_scholarship_applications  (PERSONAL — SCOPED) ----------
@tool
async def get_my_scholarship_applications(student_id):
    """Scholarship applications belonging to ONE student.

    SECURITY: student_id MUST come from the verified session token — never
    from the LLM or user input.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    pipeline = [{"$match": {"student_id": oid}}]
    pipeline += join("scholarships", "scholarship_id", "scholarship")
    pipeline += [
        {"$sort": {"application_date": -1}},
        {"$project": {
            "_id": 0,
            "scholarship_application_id": {"$toString": "$_id"},
            "scholarship":      "$scholarship.scholarship_name",
            "scholarship_type": "$scholarship.scholarship_type",
            "approval_status":  1,
            "application_date": 1,
            # student_snapshot, personal_statement, reference_1/2 excluded — PII.
        }},
    ]
    rows = await db.student_scholarships.aggregate(pipeline).to_list(length=MAX_LIMIT)
    if rows:
        return response(f"You have {len(rows)} scholarship application(s).", rows)
    return response("You don't have any scholarship applications yet.", rows)


# --- TOOL 13: get_my_profile  (PERSONAL — SCOPED) ----------------------------
@tool
async def get_my_profile(student_id):
    """Return the student's FULL profile — every meaningful field from the
    users collection, grouped into logical sections:

      • account       — user_id, user_type, email, phone_number, auth provider,
                        account verification status, profile-completion stage,
                        discovery_mode, profile image URL, created/updated dates,
                        account_created_by (ObjectId of admin if provisioned)
      • personal      — first_name, last_name, full_name, gender, date_of_birth,
                        nationality, religion, special_person status, CNIC
                        (national_id_card front/back URLs)
      • address       — streetAddress, city, stateOrProvince, districtOfDomicile,
                        provinceOfDomicile, postalCode, plus the joined address
                        document (address_line_1/2, city, state, country, lat/lng)
      • family        — father_name, father_profession, father_status,
                        father_income, fatherEmailAddress, fatherPhoneNumber,
                        mother_name, mother_profession, mother_status, mother_income
      • education     — full educational_backgrounds array (board, education_level,
                        field_of_study, marks_gpa, year_of_passing, transcript URL)
      • preferences   — onboarding_preferences (degree_goal, preferred_cities,
                        preferred_fields_of_study, semester_fee_range,
                        previous_marks_range, start_timeline)
      • legal         — accepted_legal_documents array (which T&C versions accepted)

    NEVER returned (server-side secrets):
      hash · salt · refreshTokenHash · verifyToken · verifyTokenExpiration ·
      googleId · loginAttempts · __v

    SECURITY: student_id MUST come from the verified session token — never
    from the LLM or user input.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    doc = await db.users.find_one(
        {"_id": oid},
        {
            "hash": 0, "salt": 0, "refreshTokenHash": 0,
            "verifyToken": 0, "verifyTokenExpiration": 0,
            "googleId": 0, "loginAttempts": 0, "__v": 0,
        },
    )
    if not doc:
        return response("No profile found for that student.", [])

    # ── Resolve the linked address document ───────────────────────────────────
    address_doc = {}
    if doc.get("address_id"):
        addr = await db.addresses.find_one(
            {"_id": doc["address_id"]},
            {"_id": 0, "address_line_1": 1, "address_line_2": 1,
             "city": 1, "state": 1, "country": 1, "postal_code": 1,
             "latitude": 1, "longitude": 1},
        )
        if addr:
            address_doc = addr

    # ── Resolve campus affiliation (campus admin / staff users) ───────────────
    campus_name = None
    if doc.get("campus_id"):
        campus = await db.campuses.find_one(
            {"_id": doc["campus_id"]}, {"name": 1})
        if campus:
            campus_name = campus.get("name")

    # ── Build the structured profile output ───────────────────────────────────
    profile = {

        # ── ACCOUNT ──────────────────────────────────────────────────────────
        "account": {
            "user_id":            str(doc["_id"]),
            "user_type":          doc.get("user_type"),
            "email":              doc.get("email"),
            "phone_number":       doc.get("phone_number"),
            "auth_provider":      doc.get("authProvider"),
            "email_verified":     bool(doc.get("_verified")),
            "profile_completed":  bool(doc.get("isProfileCompleted")),
            "current_stage":      doc.get("current_stage"),
            "discovery_mode":     doc.get("discovery_mode"),
            "profile_image_url":  doc.get("profile_image_url"),
            "campus_affiliation": campus_name,
            # account_created_by is set when an admin provisions the account
            # (None for self-registered users)
            "account_created_by": str(doc["createdBy"]) if doc.get("createdBy") else None,
            "created_at":         doc.get("createdAt") or doc.get("created_at"),
            "updated_at":         doc.get("updatedAt") or doc.get("updated_at"),
        },

        # ── PERSONAL ─────────────────────────────────────────────────────────
        "personal": {
            "first_name":     doc.get("first_name"),
            "last_name":      doc.get("last_name"),
            "full_name":      doc.get("full_name"),
            "gender":         doc.get("gender"),
            "date_of_birth":  doc.get("date_of_birth"),
            "nationality":    doc.get("nationality"),
            "religion":       doc.get("religion"),
            "special_person": doc.get("special_person"),
            "national_id_card": {
                "front_side": (doc.get("national_id_card") or {}).get("front_side"),
                "back_side":  (doc.get("national_id_card") or {}).get("back_side"),
            },
        },

        # ── ADDRESS ──────────────────────────────────────────────────────────
        "address": {
            "street_address":       doc.get("streetAddress"),
            "city":                 doc.get("city"),
            "state_or_province":    doc.get("stateOrProvince"),
            "district_of_domicile": doc.get("districtOfDomicile"),
            "province_of_domicile": doc.get("provinceOfDomicile"),
            "postal_code":          doc.get("postalCode"),
            "address_record":       address_doc or None,
        },

        # ── FAMILY ───────────────────────────────────────────────────────────
        "family": {
            "father_name":       doc.get("father_name"),
            "father_profession": doc.get("father_profession"),
            "father_status":     doc.get("father_status"),
            "father_income":     doc.get("father_income"),
            "father_email":      doc.get("fatherEmailAddress"),
            "father_phone":      doc.get("fatherPhoneNumber"),
            "mother_name":       doc.get("mother_name"),
            "mother_profession": doc.get("mother_profession"),
            "mother_status":     doc.get("mother_status"),
            "mother_income":     doc.get("mother_income"),
        },

        # ── EDUCATION HISTORY ────────────────────────────────────────────────
        # Each entry: board, education_level, field_of_study,
        #             marks_gpa, year_of_passing, transcript (URL)
        "education": doc.get("educational_backgrounds") or [],

        # ── ONBOARDING PREFERENCES ───────────────────────────────────────────
        # degree_goal, preferred_cities, preferred_fields_of_study,
        # semester_fee_range, previous_marks_range, start_timeline
        "preferences": doc.get("onboarding_preferences") or {},

        # ── LEGAL ────────────────────────────────────────────────────────────
        "accepted_legal_documents": doc.get("accepted_legal_documents") or [],
    }

    return response(
        f"Full profile retrieved for {profile['personal']['full_name'] or 'the student'}.",
        [serialize(profile)],
    )


# --- TOOL 13b: get_my_profile_status  (PERSONAL — SCOPED) -------------------
@tool
async def get_my_profile_status(student_id):
    """Lightweight profile-completion check — returns only the four status
    flags: profile_completed, current_stage, email_verified, has_education_info.

    For the full profile use get_my_profile() instead.

    SECURITY: student_id MUST come from the verified session token.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    doc = await db.users.find_one(
        {"_id": oid},
        {"isProfileCompleted": 1, "current_stage": 1, "_verified": 1,
         "educational_backgrounds": 1},
    )
    if not doc:
        return response("No profile found for that student.", [])

    status = {
        "profile_completed":  bool(doc.get("isProfileCompleted")),
        "current_stage":      doc.get("current_stage"),
        "email_verified":     bool(doc.get("_verified")),
        "has_education_info": bool(doc.get("educational_backgrounds")),
    }
    return response("Profile status retrieved.", [status])


# --- TOOL 14: search_academic_departments -----------------------------------
@tool
async def search_academic_departments(*, name=None, university_id=None,
                                       campus_id=None, limit=DEFAULT_LIMIT):
    """Find academic departments — their HOD, contact email, and phone."""
    pipeline = []

    dept_match = {}
    if (nf := _name_match(name, ["name"])):
        dept_match["$or"] = nf["$or"]
    if campus_id:
        oid = _oid(campus_id)
        if oid is None:
            return response("Invalid campus ID.", [])
        dept_match["campus_id"] = oid
    if dept_match:
        pipeline.append({"$match": dept_match})

    pipeline += join("campuses", "campus_id", "campus", preserve=False)
    pipeline.append({"$match": {"campus.is_test_entity": NOT_TEST}})
    if university_id:
        oid = _oid(university_id)
        if oid is None:
            return response("Invalid university ID.", [])
        pipeline.append({"$match": {"campus.university_id": oid}})
    pipeline += join("universities", "campus.university_id", "university")
    pipeline.append({"$match": {"university.is_test_entity": NOT_TEST}})

    pipeline += [
        {"$addFields": {"name_score": _name_score(name, ["name"])}},
        {"$sort":    {"name_score": -1, "name": 1}},
        {"$limit":   _clamp(limit)},
        {"$project": {
            "_id": 0,
            "department_id":     {"$toString": "$_id"},
            "name":              1,
            "head_of_department": 1,
            "contact_email":     1,
            "contact_phone":     1,
            "campus":            "$campus.name",
            "university":        "$university.name",
        }},
    ]
    rows = await db.academic_departments.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("academic departments", rows)


# --- TOOL 15: search_courses ------------------------------------------------
@tool
async def search_courses(*, name=None, program_id=None, limit=DEFAULT_LIMIT):
    """Search for individual courses by name, optionally restricted to one
    program.  Answers 'what courses are taught in X' or 'do you have a
    course on machine learning'.
    """
    match = {}
    if program_id:
        oid = _oid(program_id)
        if oid is None:
            return response("Invalid program ID.", [])
        match["$or"] = [{"program_id": oid}, {"program_id": str(oid)}]
    if (m := _ci(name)):
        match["course_name"] = m
    if not match:
        return response("Provide a course name or a program ID to search.", [])

    pipeline = [{"$match": match}]
    pipeline.append({"$lookup": {
        "from": "programs",
        "let":  {"pid": "$program_id"},
        "pipeline": [
            {"$match": {"$expr": {"$or": [
                {"$eq": ["$_id", {"$toObjectId": {"$ifNull": ["$$pid", "000000000000000000000000"]}}]},
                {"$eq": [{"$toString": "$_id"}, "$$pid"]},
            ]}}},
        ],
        "as": "program_doc",
    }})
    pipeline.append({"$unwind": {"path": "$program_doc",
                                 "preserveNullAndEmptyArrays": True}})
    pipeline += join("campuses", "program_doc.campus_id", "campus")
    pipeline.append({"$match": {"$or": [
        {"campus.is_test_entity": NOT_TEST},
        {"campus": {"$exists": False}},
    ]}})

    pipeline += [
        {"$sort":  {"course_name": 1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "course_id":          {"$toString": "$_id"},
            "course_name":        1,
            "course_duration":    1,
            "course_description": 1,
            "program":            "$program_doc.name",
            "program_id":         {"$toString": "$program_doc._id"},
            "degree_level":       "$program_doc.degree_level",
            "campus":             "$campus.name",
        }},
    ]
    rows = await db.courses.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("courses", rows)


# --- TOOL 16: get_blog_posts -------------------------------------------------
@tool
async def get_blog_posts(*, category=None, tag=None, limit=DEFAULT_LIMIT):
    """Return published blog posts — news, guides, articles on the platform."""
    match = {"published": True}
    if (m := _ci(category)): match["category"] = m
    if (m := _ci(tag)):      match["tags"] = m

    pipeline = [
        {"$match": match},
        {"$sort":  {"published_at": -1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "post_id":      {"$toString": "$_id"},
            "title":        1,
            "excerpt":      1,
            "category":     1,
            "tags":         1,
            "published_at": 1,
            "featured":     1,
            "slug":         1,
            "views_count":  1,
            "posted_by_name": 1,
            # markdown_content excluded — too large; direct to slug for full post.
        }},
    ]
    rows = await db.blog_posts.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("blog posts", rows)


# --- TOOL 17: get_my_conversations  (PERSONAL — SCOPED) ---------------------
@tool
async def get_my_conversations(student_id, *, limit=DEFAULT_LIMIT):
    """Return the student's conversation threads with campuses — preview,
    last-message metadata, and unread flag.

    Use get_my_messages() to read the actual content of a conversation.

    SECURITY: student_id MUST come from the verified session token.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    pipeline = [
        {"$match": {"user_id": oid, "_deleted": {"$ne": True}, "is_active": True}},
    ]
    pipeline += join("campuses", "campus_id", "campus")
    pipeline += [
        {"$sort":  {"last_message_time": -1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "conversation_id":      {"$toString": "$_id"},
            "campus":               "$campus.name",
            "campus_id":            {"$toString": "$campus._id"},
            "last_message_preview": "$last_message",
            "last_message_sender":  1,
            "last_message_time":    1,
            "unread_by_you":        "$is_read_by_user",
        }},
    ]
    rows = await db.conversations.aggregate(pipeline).to_list(length=MAX_LIMIT)
    for row in rows:
        row["has_unread"] = not row.pop("unread_by_you", True)
    if rows:
        unread  = sum(1 for r in rows if r["has_unread"])
        summary = (f"You have {len(rows)} conversation(s)"
                   + (f", {unread} with unread messages." if unread else "."))
        return response(summary, rows)
    return response("You have no active conversations yet.", rows)


# --- TOOL 18 (new): get_my_messages  (PERSONAL — SCOPED) --------------------
@tool
async def get_my_messages(student_id, conversation_id, *, limit=DEFAULT_LIMIT):
    """Read the actual messages in one of the student's conversations.
    Returns message content, sender type, timestamps, and per-message read
    receipts.  Results are returned in chronological order (oldest first).

    Use get_my_conversations() first to discover conversation IDs.

    Answers: 'show me my messages with X campus', 'what did they say',
             'read the last message from NUST'.

    SECURITY: student_id MUST come from the verified session token.
    The conversation ownership is verified server-side before any messages
    are returned — a student can never read another student's messages.
    """
    s_oid = _oid(student_id)
    c_oid = _oid(conversation_id)
    if s_oid is None:
        return response("Invalid student ID.", [])
    if c_oid is None:
        return response("Invalid conversation ID.", [])

    # Ownership check — conversation must belong to this student
    conv = await db.conversations.find_one(
        {"_id": c_oid, "user_id": s_oid, "_deleted": {"$ne": True}},
        {"campus_id": 1},
    )
    if not conv:
        return response(
            "Conversation not found or does not belong to you.", [])

    # Resolve campus name for context
    campus_name = None
    if conv.get("campus_id"):
        campus = await db.campuses.find_one(
            {"_id": conv["campus_id"]}, {"name": 1})
        if campus:
            campus_name = campus.get("name")

    pipeline = [
        {"$match": {"conversation_id": c_oid}},
        {"$sort":  {"createdAt": -1}},   # newest first so $limit keeps the latest N
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "message_id":         {"$toString": "$_id"},
            "content":            1,
            "sender_type":        1,   # 'user' | 'campus' | 'admin'
            "sender_type_ref":    1,
            "is_read_by_user":    1,
            "is_read_by_campus":  1,
            "attachments":        1,
            "sent_at":            "$createdAt",
        }},
    ]
    rows = await db.messages.aggregate(pipeline).to_list(length=MAX_LIMIT)

    # Flip to chronological order for natural reading
    rows.reverse()

    if rows:
        summary = (f"Retrieved {len(rows)} message(s)"
                   + (f" with {campus_name}." if campus_name else "."))
        return response(summary, rows)
    return response("No messages found in this conversation.", rows)


# --- TOOL 19: get_my_notifications  (PERSONAL — SCOPED) ---------------------
@tool
async def get_my_notifications(student_id, *, limit=DEFAULT_LIMIT):
    """Return notifications sent to this student — platform announcements,
    application status updates, and admission alerts.

    SECURITY: student_id MUST come from the verified session token.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    pipeline = [
        {"$match": {"$or": [
            {"audience.isGlobal": True},
            {"audience.recipients": oid},
            {"audience.recipients": str(oid)},
        ]}},
        {"$sort":  {"createdAt": -1}},
        {"$limit": _clamp(limit)},
        {"$lookup": {
            "from": "notification_read_receipts",
            "let":  {"nid": "$_id"},
            "pipeline": [
                {"$match": {"$expr": {"$and": [
                    {"$eq": ["$notificationId", "$$nid"]},
                    {"$eq": ["$userId", oid]},
                ]}}},
            ],
            "as": "receipt",
        }},
        {"$project": {
            "_id": 0,
            "notification_id": {"$toString": "$_id"},
            "title":           1,
            "message":         1,
            "category":        1,
            "created_at":      "$createdAt",
            "read_at":         {"$arrayElemAt": ["$receipt.readAt", 0]},
        }},
    ]
    rows = await db.notifications.aggregate(pipeline).to_list(length=MAX_LIMIT)
    if rows:
        unread  = sum(1 for r in rows if not r.get("read_at"))
        summary = (f"You have {len(rows)} notification(s)"
                   + (f", {unread} unread." if unread else ", all read."))
        return response(summary, rows)
    return response("No notifications found for you.", rows)


# --- TOOL 20: get_my_external_applications  (PERSONAL — SCOPED) -------------
@tool
async def get_my_external_applications(student_id):
    """External (off-platform) applications made by this student.

    SECURITY: student_id MUST come from the verified session token.
    """
    oid = _oid(student_id)
    if oid is None:
        return response("Invalid student ID.", [])

    pipeline = [{"$match": {"applicant": oid}}]
    pipeline += join("programs",     "program",    "program_doc")
    pipeline += join("campuses",     "campus",     "campus_doc")
    pipeline += join("universities", "university", "university_doc")
    pipeline.append({"$match": {
        "campus_doc.is_test_entity":     NOT_TEST,
        "university_doc.is_test_entity": NOT_TEST,
    }})
    pipeline += [
        {"$sort": {"createdAt": -1}},
        {"$project": {
            "_id": 0,
            "external_application_id": {"$toString": "$_id"},
            "program":      "$program_doc.name",
            "degree_level": "$program_doc.degree_level",
            "campus":       "$campus_doc.name",
            "university":   "$university_doc.name",
            "applied_at":   "$createdAt",
            # applicant_snapshot deliberately excluded — PII.
        }},
    ]
    rows = await db.external_applications.aggregate(pipeline).to_list(
        length=MAX_LIMIT)
    if rows:
        return response(
            f"You have {len(rows)} external application(s) on record.", rows)
    return response("No external applications found for you.", rows)


# --- TOOL 21: search_organizations -------------------------------------------
@tool
async def search_organizations(*, name=None, organization_type=None,
                               country=None, limit=DEFAULT_LIMIT):
    """Find scholarship-granting organizations."""
    match = {}
    if (m := _name_match(name, ["organization_name"])):
        match.update(m)
    if (m := _ci(organization_type)):
        match["organization_type"] = m

    pipeline = []
    if match:
        pipeline.append({"$match": match})

    pipeline += join("countries", "country", "country_doc")
    if (m := _ci(country)):
        pipeline.append({"$match": {"country_doc.name": m}})

    pipeline += [
        {"$addFields": {"name_score": _name_score(name, ["organization_name"])}},
        {"$sort":  {"name_score": -1, "organization_name": 1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "organization_id":   {"$toString": "$_id"},
            "name":              "$organization_name",
            "organization_type": 1,
            "country":           "$country_doc.name",
            "contact_email":     1,
            "contact_phone":     1,
            "website_url":       1,
        }},
    ]
    rows = await db.organizations.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("organizations", rows)


# --- TOOL 22: browse_program_templates ----------------------------------------
@tool
async def browse_program_templates(*, degree_level=None, field_of_study=None,
                                   name=None, limit=DEFAULT_LIMIT):
    """Browse the canonical program-template catalog."""
    match = {}
    if (m := _degree_match(degree_level)):
        match["degree_level"] = m
    if (m := _ci(field_of_study)):
        match["field_of_study"] = m

    name_fields = ["name", "short_name", "abbreviation"]
    if (nf := _name_match(name, name_fields)):
        match.update(nf)

    pipeline = []
    if match:
        pipeline.append({"$match": match})

    pipeline += [
        {"$addFields": {"name_score": _name_score(name, name_fields)}},
        {"$sort":  {"name_score": -1, "degree_level": 1, "name": 1}},
        {"$limit": _clamp(limit)},
        {"$project": {
            "_id": 0,
            "template_id":    {"$toString": "$_id"},
            "name":           1,
            "short_name":     1,
            "abbreviation":   1,
            "degree_level":   1,
            "field_of_study": 1,
            "tags":           1,
        }},
    ]
    rows = await db.program_templates.aggregate(pipeline).to_list(length=MAX_LIMIT)
    return listing("program templates", rows)


# --- TOOL 23: get_legal_documents --------------------------------------------
@tool
async def get_legal_documents(*, document_type=None):
    """Return the platform's active legal documents — Terms of Service,
    Privacy Policy, etc.  The full `content` body is omitted; only metadata
    is returned so the chatbot can direct students to the in-app viewer.
    """
    match = {"status": {"$regex": "active|published", "$options": "i"}}
    if (m := _ci(document_type)):
        match["document_type"] = m

    cursor = db.legal_documents.find(
        match,
        {"_id": 1, "title": 1, "document_type": 1,
         "effective_date": 1, "status": 1, "createdAt": 1},
    ).sort("effective_date", -1)

    rows = await cursor.to_list(length=20)
    clean = [
        {
            "document_id":   str(r["_id"]),
            "title":         r.get("title"),
            "document_type": r.get("document_type"),
            "effective_date": r.get("effective_date"),
            "status":        r.get("status"),
        }
        for r in rows
    ]
    return listing("legal documents", serialize(clean))


# --- TOOL 24: list_countries -------------------------------------------------
@tool
async def list_countries():
    """Return countries supported by the platform."""
    cursor = db.countries.find(
        {},
        {"_id": 1, "name": 1, "iso_code": 1, "dial_code": 1, "region": 1},
    ).sort("name", 1)
    rows  = await cursor.to_list(length=50)
    clean = [
        {
            "country_id": str(r["_id"]),
            "name":       r.get("name"),
            "iso_code":   r.get("iso_code"),
            "dial_code":  r.get("dial_code"),
            "region":     r.get("region"),
        }
        for r in rows
    ]
    return listing("countries", serialize(clean))


# --- TOOL 25: check_payment_status  (PERSONAL — SCOPED) ---------------------
@tool
async def check_payment_status(student_id, *, application_id=None):
    """Check payment verification for one or all of a student's applications.

    SECURITY: student_id MUST come from the verified session token.
    """
    s_oid = _oid(student_id)
    if s_oid is None:
        return response("Invalid student ID.", [])

    app_match: dict = {"$or": [{"applicant": s_oid}, {"student_id": str(s_oid)}]}
    if application_id:
        a_oid = _oid(application_id)
        if a_oid is None:
            return response("Invalid application ID.", [])
        app_match["_id"] = a_oid

    app_cursor = db.applications.find(app_match, {"_id": 1, "status": 1,
                                                   "program": 1, "campus_id": 1})
    apps = await app_cursor.to_list(length=MAX_LIMIT)
    if not apps:
        return response("No applications found for that student.", [])

    app_ids   = [a["_id"] for a in apps]
    app_index = {a["_id"]: a for a in apps}

    pay_cursor = db.payments.find(
        {"applicationId": {"$in": app_ids}},
        {"_id": 1, "applicationId": 1, "depositAmount": 1, "depositDate": 1,
         "bankName": 1, "branchAddress": 1, "paymentVerified": 1,
         "feeInvoiceUrl": 1},
    )
    payments = await pay_cursor.to_list(length=MAX_LIMIT)

    rows = []
    for pay in payments:
        app = app_index.get(pay.get("applicationId"), {})
        rows.append({
            "payment_id":          str(pay["_id"]),
            "application_id":      str(pay.get("applicationId", "")),
            "application_status":  app.get("status"),
            "deposit_amount":      pay.get("depositAmount"),
            "deposit_date":        pay.get("depositDate"),
            "bank_name":           pay.get("bankName"),
            "branch_address":      pay.get("branchAddress"),
            "payment_verified":    pay.get("paymentVerified"),
            "invoice_url":         pay.get("feeInvoiceUrl"),
        })

    if rows:
        verified = sum(1 for r in rows if r["payment_verified"])
        return response(
            f"Found {len(rows)} payment record(s); {verified} verified.", rows)
    return response("No payment records found for your application(s).", rows)


# ============================================================
# quick local test — run each tool once
# ============================================================
if __name__ == "__main__":
    import json

    logging.basicConfig(level=logging.INFO,
                        format="%(levelname)s %(name)s %(message)s")

    async def _test():
        def show(label, res):
            print(f"\n=== {label} ===")
            print("summary:", res["summary"])
            print(json.dumps(res["results"][:2], indent=2, default=str))

        progs = await search_programs(major="computer science", limit=5)
        show("search_programs", progs)
        show("search_programs (cheapest first)",
             await search_programs(major="computer science",
                                   sort_by="fee_low", limit=5))

        show("list_majors", await list_majors())

        unis = await search_universities(city="Islamabad", limit=5)
        show("search_universities", unis)
        if unis["results"]:
            uid = unis["results"][0]["university_id"]
            show("get_university_details", await get_university_details(uid))
            show("search_programs (by university)",
                 await search_programs(university_id=uid, limit=5))

        show("search_scholarships",
             await search_scholarships(degree_level="Bachelor", limit=5))

        adm = await get_open_admissions(limit=5)
        show("get_open_admissions", adm)
        if adm["results"]:
            aid = adm["results"][0]["admission_id"]
            show("get_admission_programs",
                 await get_admission_programs(admission_id=aid))

        if progs["results"]:
            pid = progs["results"][0]["program_id"]
            show("get_program_details", await get_program_details(pid))
            show("get_fee_structure",   await get_fee_structure(pid))

        show("search_courses (by name)",
             await search_courses(name="data structures", limit=5))
        if progs["results"]:
            show("search_courses (by program)",
                 await search_courses(program_id=progs["results"][0]["program_id"],
                                      limit=5))

        show("get_blog_posts", await get_blog_posts(limit=4))
        show("get_blog_posts (scholarships)",
             await get_blog_posts(tag="scholarships", limit=4))

        show("search_organizations", await search_organizations(limit=5))
        show("search_organizations (govt)",
             await search_organizations(organization_type="government", limit=5))

        show("browse_program_templates (Bachelor)",
             await browse_program_templates(degree_level="Bachelor", limit=5))
        show("browse_program_templates (CS)",
             await browse_program_templates(field_of_study="computer science",
                                            limit=5))

        show("get_legal_documents", await get_legal_documents())
        show("list_countries",      await list_countries())

        # --- personal tools (need a real student _id from your users collection)
        # show("get_my_applications",
        #      await get_my_applications("<student_id>"))
        # show("get_my_scholarship_applications",
        #      await get_my_scholarship_applications("<student_id>"))
        # show("get_my_profile",
        #      await get_my_profile("<student_id>"))
        # show("get_my_profile_status",
        #      await get_my_profile_status("<student_id>"))
        # show("get_my_conversations",
        #      await get_my_conversations("<student_id>", limit=5))
        # show("get_my_messages",
        #      await get_my_messages("<student_id>", "<conversation_id>", limit=20))
        # show("get_my_notifications",
        #      await get_my_notifications("<student_id>", limit=5))
        # show("get_my_external_applications",
        #      await get_my_external_applications("<student_id>"))
        # show("check_payment_status",
        #      await check_payment_status("<student_id>"))
        # show("check_payment_status (one application)",
        #      await check_payment_status("<student_id>",
        #                                  application_id="<app_id>"))

    asyncio.run(_test())