"""
orchestrator.py — Phase 3: the chat engine for the ScholarBee assistant.

Takes a student's message, hands all 15 tools to Gemini, lets Gemini decide
which to call, runs them server-side, and composes the final answer.

  chat(user_message, history, student_id)  ->  (answer_text, updated_history)

DESIGN
  - Manual function calling: the 15 tools are declared to Gemini, but THIS
    file executes them — so the personal get_my_* tools get their student_id
    injected from the verified session, never from the model or user input.
  - 14 data tools come from data_tools.py, search_help_articles from kb_tools.py.
  - Guardrails: a hard cap on tool-call rounds, and per-turn de-duplication of
    identical tool calls.

SETUP
  pip install google-genai
  Add your key to the .env file:   GEMINI_API_KEY="..."
  (data_tools.py / kb_tools.py must be importable from the same folder.)

TEST
  python orchestrator.py        — a terminal REPL to chat with the bot

NOTE
  The data tools query whatever MONGODB_URI points at. To exercise them you
  need the ScholarBee data on that database; search_help_articles needs the
  Atlas kb_vector_index. The orchestrator itself does not care where the data
  lives — it just calls the tool functions.
"""

import asyncio
import json
import logging
import os

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

# the tool functions — importing data_tools also runs its load_dotenv()
import data_tools as dt
import kb_tools as kb

logger = logging.getLogger("chatbot.orchestrator")

# ============================================================
# config
# ============================================================
DEFAULT_MODEL = "gemini-2.0-flash-lite"
MAX_TOOL_STEPS = 6              # max tool-call rounds per user turn
TEMPERATURE = 0.3               # low — this is a factual assistant

_gemini = None
_active_model: str | None = None


def _model_candidates() -> list[str]:
    """Primary + fallbacks from env; deduped. Nest passes GEMINI_MODEL / GEMINI_MODEL_FALLBACKS."""
    primary = (os.environ.get("GEMINI_MODEL") or DEFAULT_MODEL).strip()
    fallbacks_raw = os.environ.get("GEMINI_MODEL_FALLBACKS", "")
    fallbacks = [m.strip() for m in fallbacks_raw.split(",") if m.strip()]
    builtin = (
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-flash-latest",
    )
    seen: set[str] = set()
    ordered: list[str] = []
    for name in (primary, *fallbacks, *builtin):
        if name and name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered


def _should_try_next_model(exc: BaseException) -> bool:
    """Only rotate models when the name is missing — not for quota/billing errors."""
    if isinstance(exc, genai_errors.ClientError):
        code = getattr(exc, "code", None) or ""
        if str(code) == "404" or "NOT_FOUND" in str(exc):
            return True
        return False
    msg = str(exc)
    return "404" in msg and "NOT_FOUND" in msg


async def _generate_content(client, *, contents, config):
    """Call Gemini; try alternate models only when the model id is not found."""
    global _active_model
    candidates = _model_candidates()
    last_error: BaseException | None = None

    for model in candidates:
        try:
            resp = await client.aio.models.generate_content(
                model=model, contents=contents, config=config
            )
            if _active_model != model:
                logger.info("using Gemini model: %s", model)
            _active_model = model
            return resp
        except Exception as exc:
            last_error = exc
            if _should_try_next_model(exc):
                logger.warning("Gemini model %r unavailable, trying next", model)
                continue
            raise

    raise last_error or RuntimeError(
        f"No Gemini model available. Tried: {', '.join(candidates)}"
    )


def _client():
    """Lazily create the Gemini client (so importing this file is cheap)."""
    global _gemini
    if _gemini is None:
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set — add it to your .env file.")
        _gemini = genai.Client(api_key=key)
    return _gemini


# ============================================================
# system prompt
# ============================================================
SYSTEM_PROMPT = """You are the ScholarBee assistant — a warm, knowledgeable \
helper for students in Pakistan who are exploring universities, degree \
programs, and scholarships, and applying to them through the ScholarBee \
platform.

USING YOUR TOOLS
- Always use the tools to get real information. Never invent or guess a \
university, program, fee, deadline, scholarship, seat count, eligibility \
number, or any other fact. State only what a tool actually returns.
- For finding or comparing universities, programs, or scholarships, and for \
fees, campuses, and admission cycles, use the data tools (search_programs, \
search_universities, search_scholarships, the get_*_details tools, \
get_fee_structure, get_open_admissions, get_admission_programs, \
get_campus_info, list_majors).
- The search tools return records together with their IDs. To get full detail \
on one item, pass that ID to the matching get_* tool. Use IDs only for tool \
calls — never show a raw ID to the student; always refer to things by name.
- For "how do I...", process, document, or concept questions (how to apply, \
what documents are needed, the fee/challan process, what CGPA or aggregate or \
domicile mean), use search_help_articles.
- For anything about the student's OWN applications, scholarship applications, \
or profile, use the get_my_* tools. You already know who the student is — \
never ask them for a student ID, email, or login details.
- You may call several tools, and call them in sequence when needed (for \
example: search for a program, then look up its fee structure).
- If a tool returns nothing, say so honestly and suggest the student rephrase \
or contact the university directly. Never fill the gap with a guess.

HOW TO ANSWER
- Be warm, clear, and concise. Your audience is students, often young and \
anxious about admissions — use plain language and a reassuring tone.
- Present eligibility criteria and requirements as information, and let the \
student judge their own fit. Do not promise admission or give a definite \
"you qualify / you don't" verdict; when it matters, suggest confirming with \
the university.
- Stay on topic: universities, programs, scholarships, admissions, fees, and \
using ScholarBee. Politely decline anything unrelated.
- If you genuinely cannot find or verify something, say so plainly."""


# ============================================================
# tool declarations  (what the model sees)
# ============================================================
_STR = types.Type.STRING
_NUM = types.Type.NUMBER
_INT = types.Type.INTEGER


def _p(type_, description, enum=None):
    return types.Schema(type=type_, description=description, enum=enum)


def _decl(name, description, properties=None, required=None):
    """Build a FunctionDeclaration. No properties => a no-argument tool."""
    params = None
    if properties:
        params = types.Schema(type=types.Type.OBJECT,
                               properties=properties,
                               required=required or [])
    return types.FunctionDeclaration(name=name, description=description,
                                     parameters=params)


_DECLARATIONS = [
    _decl("search_programs",
          "Search degree programs. Filter by major/field, degree level "
          "(e.g. Bachelors, Masters, PhD), mode of study, city, maximum "
          "tuition, or restrict to a specific university or campus by ID. "
          "Returns programs with their program_id, fees, and basic info.",
          {
              "major": _p(_STR, "Field of study, e.g. 'Computer Science'."),
              "degree_level": _p(_STR, "e.g. 'Bachelors', 'Masters', 'PhD'."),
              "mode_of_study": _p(_STR, "e.g. 'On Campus', 'Online'."),
              "city": _p(_STR, "City to filter by."),
              "max_tuition": _p(_NUM, "Maximum tuition fee."),
              "university_id": _p(_STR, "Restrict to one university (its ID)."),
              "campus_id": _p(_STR, "Restrict to one campus (its ID)."),
              "sort_by": _p(_STR, "Result ordering.",
                            enum=["relevance", "fee_low", "fee_high"]),
              "limit": _p(_INT, "Max results to return (default 10)."),
          }),

    _decl("get_program_details",
          "Get full details for ONE program by its program_id — description, "
          "fee structure, and course list. Get the program_id from "
          "search_programs first.",
          {"program_id": _p(_STR, "The program's ID.")},
          required=["program_id"]),

    _decl("search_universities",
          "Search universities by name, city, or type (e.g. Public, Private). "
          "Returns universities with their university_id, ranking, and city.",
          {
              "name": _p(_STR, "Full or partial university name."),
              "city": _p(_STR, "City to filter by."),
              "type": _p(_STR, "University type, e.g. 'Public' or 'Private'."),
              "limit": _p(_INT, "Max results to return (default 10)."),
          }),

    _decl("get_university_details",
          "Get full details for ONE university by its university_id, including "
          "its campuses. Get the university_id from search_universities first.",
          {"university_id": _p(_STR, "The university's ID.")},
          required=["university_id"]),

    _decl("search_scholarships",
          "Search scholarships by degree level, country, scholarship type, or "
          "major. Optionally filter by status. Returns scholarships with "
          "eligibility, amount, deadline, and application link.",
          {
              "degree_level": _p(_STR, "e.g. 'Bachelors', 'Masters'."),
              "country": _p(_STR, "Country the scholarship is for."),
              "scholarship_type": _p(_STR, "e.g. 'Merit', 'Need-based'."),
              "major": _p(_STR, "Field of study the scholarship applies to."),
              "status": _p(_STR, "Filter by status, e.g. 'active' or 'closed'. "
                                  "Omit to include all statuses."),
              "limit": _p(_INT, "Max results to return (default 10)."),
          }),

    _decl("get_open_admissions",
          "List admission cycles, optionally for a specific university (by ID) "
          "or city. Each result has the admission's title, deadline, seats, "
          "and status.",
          {
              "university_id": _p(_STR, "Restrict to one university (its ID)."),
              "city": _p(_STR, "City to filter by."),
              "status": _p(_STR, "Filter by status, e.g. 'published'. Omit to "
                                  "include all statuses."),
              "limit": _p(_INT, "Max results to return (default 10)."),
          }),

    _decl("get_admission_programs",
          "List which specific programs are accepting applications, with "
          "requirements, fee, seats, and the apply link. Provide EITHER a "
          "program_id (entries for that program) OR an admission_id (all "
          "programs under that admission cycle).",
          {
              "program_id": _p(_STR, "A program's ID."),
              "admission_id": _p(_STR, "An admission cycle's ID."),
          }),

    _decl("get_fee_structure",
          "Get the detailed fee breakdown for ONE program by its program_id — "
          "tuition, application fee, per-semester totals, and other fees.",
          {"program_id": _p(_STR, "The program's ID.")},
          required=["program_id"]),

    _decl("get_campus_info",
          "Get details for ONE campus by its campus_id — contact information, "
          "facilities, and location.",
          {"campus_id": _p(_STR, "The campus's ID.")},
          required=["campus_id"]),

    _decl("list_majors",
          "List the distinct majors / fields of study available, with how "
          "many programs each has. Optionally restrict to one university or "
          "campus (by ID) or a degree level. Answers 'what can I study at X'.",
          {
              "university_id": _p(_STR, "Restrict to one university (its ID)."),
              "campus_id": _p(_STR, "Restrict to one campus (its ID)."),
              "degree_level": _p(_STR, "e.g. 'Bachelors', 'Masters'."),
          }),

    _decl("search_academic_departments",
          "Find academic departments and their head of department (HOD), "
          "contact email, and phone. Filter by department name or field "
          "(e.g. 'Computer Science') and/or restrict to one university or "
          "campus by ID. Use for questions about a department's HOD or how "
          "to contact a specific department.",
          {
              "name": _p(_STR, "Department name or field, e.g. "
                                "'Computer Science'."),
              "university_id": _p(_STR, "Restrict to one university (its ID)."),
              "campus_id": _p(_STR, "Restrict to one campus (its ID)."),
              "limit": _p(_INT, "Max results to return (default 10)."),
          }),

    _decl("get_my_applications",
          "Get the current student's OWN program applications — status, "
          "submission date, fees, and payment info. Use for questions like "
          "'my applications' or 'have I applied anywhere'. Takes no arguments."),

    _decl("get_my_scholarship_applications",
          "Get the current student's OWN scholarship applications and their "
          "approval status. Use for questions about scholarship applications "
          "the student has submitted. Takes no arguments."),

    _decl("get_my_profile_status",
          "Get the current student's profile-completion status — whether the "
          "profile is complete, the current stage, email verification, and "
          "whether education info has been added. Use for 'is my profile "
          "complete' or 'what do I need before applying'. Takes no arguments."),

    _decl("search_help_articles",
          "Semantic search over the help knowledge base — how to apply, "
          "required documents, the fee/challan process, the scholarship "
          "process, and general concepts (CGPA, aggregate, domicile, quotas, "
          "merit lists, etc.) that are NOT specific database records. Use this "
          "for 'how do I...', process, and concept questions.",
          {
              "query": _p(_STR, "The student's question, in natural language."),
              "category": _p(_STR, "Optional category filter, one of: "
                                    "concepts, admissions, applying, fees, "
                                    "scholarships, account, support."),
              "limit": _p(_INT, "Max articles to return (default 5)."),
          },
          required=["query"]),
]

TOOLS = types.Tool(function_declarations=_DECLARATIONS)


# ============================================================
# tool registry + executor
# ============================================================
TOOL_FUNCS = {
    "search_programs": dt.search_programs,
    "get_program_details": dt.get_program_details,
    "search_universities": dt.search_universities,
    "get_university_details": dt.get_university_details,
    "search_scholarships": dt.search_scholarships,
    "get_open_admissions": dt.get_open_admissions,
    "get_admission_programs": dt.get_admission_programs,
    "get_fee_structure": dt.get_fee_structure,
    "get_campus_info": dt.get_campus_info,
    "list_majors": dt.list_majors,
    "search_academic_departments": dt.search_academic_departments,
    "get_my_applications": dt.get_my_applications,
    "get_my_scholarship_applications": dt.get_my_scholarship_applications,
    "get_my_profile_status": dt.get_my_profile_status,
    "search_help_articles": kb.search_help_articles,
}

# personal tools: student_id is injected here from the session, never the LLM
PERSONAL_TOOLS = {
    "get_my_applications",
    "get_my_scholarship_applications",
    "get_my_profile_status",
}


async def _run_tool(name, args, student_id):
    """Execute one tool call. Returns the tool's {summary, results, count}."""
    func = TOOL_FUNCS.get(name)
    if func is None:
        return {"summary": f"Unknown tool '{name}'.", "results": [], "count": 0}

    if name in PERSONAL_TOOLS:
        # ignore anything the model passed — student_id comes from the session
        call_args = {"student_id": student_id}
    else:
        call_args = dict(args)

    try:
        return await func(**call_args)
    except Exception:
        logger.exception("tool %s crashed", name)
        return {"summary": f"The {name} tool failed.", "results": [], "count": 0}


def _extract_text(content):
    """Join all text parts of a model response into one string."""
    if not content or not content.parts:
        return ""
    return "".join(p.text for p in content.parts if p.text).strip()


# ============================================================
# the chat loop
# ============================================================
def _build_system_prompt(user_first_name=None):
    """Personalize the assistant when we know the student's first name."""
    if not user_first_name:
        return SYSTEM_PROMPT
    greeting = (
        f"The student's first name is {user_first_name}. When appropriate, "
        f"address them warmly by name (e.g. Hi {user_first_name}). "
    )
    return greeting + SYSTEM_PROMPT


async def chat(user_message, history=None, student_id=None, user_first_name=None):
    """Run one user turn.

    user_message : the student's message text.
    history      : list of types.Content from earlier turns (None for a new
                   conversation). Pass back the value returned last turn.
    student_id   : the verified student _id from the session. Injected into
                   the personal tools — NEVER exposed to the model.
    user_first_name : optional first name from the authenticated platform user.

    Returns (answer_text, updated_history).
    """
    contents = list(history or [])
    contents.append(types.Content(role="user",
                                   parts=[types.Part(text=user_message)]))

    system_instruction = _build_system_prompt(user_first_name)

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        tools=[TOOLS],
        temperature=TEMPERATURE,
    )
    client = _client()
    seen = {}   # (tool_name, args_json) -> result  — de-dupe within this turn

    for _ in range(MAX_TOOL_STEPS):
        resp = await _generate_content(client, contents=contents, config=config)

        if not resp.candidates or resp.candidates[0].content is None:
            return ("Sorry, I couldn't generate a response right now. "
                    "Please try again.", contents)

        content = resp.candidates[0].content
        contents.append(content)

        calls = [p.function_call for p in (content.parts or [])
                 if p.function_call]
        if not calls:
            return _extract_text(content) or "(no response)", contents

        # run every requested tool call, then feed the results back
        response_parts = []
        for call in calls:
            args = dict(call.args) if call.args else {}
            cache_key = (call.name,
                         json.dumps(args, sort_keys=True, default=str))
            if cache_key in seen:
                result = seen[cache_key]
            else:
                result = await _run_tool(call.name, args, student_id)
                seen[cache_key] = result
            response_parts.append(types.Part.from_function_response(
                name=call.name, response=result))
        contents.append(types.Content(role="user", parts=response_parts))

    # tool budget exhausted — ask once more, without tools, for a final answer
    final = await _generate_content(
        client,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=TEMPERATURE,
        ),
    )
    if final.candidates and final.candidates[0].content:
        return (_extract_text(final.candidates[0].content)
                or "(no response)", contents)
    return ("Sorry, I wasn't able to finish that — please try rephrasing.",
            contents)


# ============================================================
# terminal REPL for standalone testing
# ============================================================
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                         format="%(levelname)s %(name)s %(message)s")

    async def _repl():
        print("ScholarBee assistant — type 'quit' to exit.\n")
        # personal tools (my applications / scholarships / profile) need a real
        # student _id from your users collection. Leave blank to skip them.
        student_id = input("student_id (blank to skip personal tools): ").strip()
        student_id = student_id or None

        history = []
        while True:
            try:
                msg = input("\nyou: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if msg.lower() in {"quit", "exit"}:
                break
            if not msg:
                continue
            try:
                answer, history = await chat(msg, history, student_id)
                print(f"\nbot: {answer}")
            except Exception as exc:                  # keep the REPL alive
                logger.exception("chat turn failed")
                print(f"\n[error] {exc}")

    asyncio.run(_repl())
