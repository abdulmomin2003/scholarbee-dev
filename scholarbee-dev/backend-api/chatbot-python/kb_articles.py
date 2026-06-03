"""
kb_articles.py — Knowledge-base content for ScholarBee.

Categories used
  concepts     — what things mean (credit hours, degree types, admission cycles)
  admissions   — eligibility, deadlines, documents, merit, entry tests
  applying     — step-by-step platform how-to (creating account → submission)
  fees         — application fee, challan, payment proof, waivers
  scholarships — types, eligibility, application, disbursement
  account      — profile, password, notifications, data changes
  support      — contact, complaints, technical issues

Team notes are marked [Team: ...] — verify those details against your actual UI
before going live.  Everything else is accurate and safe to embed as-is.
"""

ARTICLES = [

    # =========================================================================
    # CATEGORY: concepts
    # =========================================================================

    {
        "slug": "what-is-credit-hour",
        "title": "What is a credit hour?",
        "category": "concepts",
        "tags": ["credit hour", "CHs", "course load", "semester"],
        "body": (
            "A credit hour (CH) is the standard unit universities use to measure "
            "academic workload. One credit hour typically equals one hour of "
            "classroom instruction per week for a 16-18 week semester, plus two "
            "hours of independent study outside class.\n\n"
            "A full-time undergraduate student usually carries 15–18 credit hours "
            "per semester. A three-credit course meets for roughly three hours per "
            "week. Lab courses often carry one additional credit for the practical "
            "component. Your total credit hours across all semesters must reach the "
            "program's minimum (commonly 130-136 for a four-year bachelor's) to "
            "qualify for graduation."
        ),
    },

    {
        "slug": "degree-levels-explained",
        "title": "What are the different degree levels (Matric, Inter, Bachelor's, Master's, PhD)?",
        "category": "concepts",
        "tags": ["matric", "intermediate", "bachelor", "master", "phd", "degree level"],
        "body": (
            "Pakistani education follows this ladder:\n\n"
            "Matric (SSC) — 10 years of schooling, grades 9-10. Equivalent to O-levels.\n\n"
            "Intermediate (HSSC / FSc / FA / ICS / ICom) — grades 11-12. Two-year "
            "program after Matric. Equivalent to A-levels.\n\n"
            "Bachelor's — typically 4 years (BS/BBA/MBBS etc.) after Intermediate. "
            "Some older 2-year BA/BSc programs still exist but are being phased out.\n\n"
            "Master's (MS/MA/MSc/MBA) — 1.5–2 years after a relevant bachelor's. "
            "MS programs usually require a thesis or research project.\n\n"
            "MPhil — a research degree between Master's and PhD, typically 2 years.\n\n"
            "PhD — 3-5 years minimum after an MS/MPhil. Requires original research "
            "and a dissertation."
        ),
    },

    {
        "slug": "what-is-cgpa",
        "title": "What is CGPA and how is it calculated?",
        "category": "concepts",
        "tags": ["CGPA", "GPA", "grades", "percentage", "marks"],
        "body": (
            "CGPA (Cumulative Grade Point Average) is a weighted average of your "
            "grades across all completed semesters, where each course's grade is "
            "weighted by its credit hours.\n\n"
            "Most Pakistani universities use a 4.0 grade-point scale, but the "
            "percentage range mapped to each grade varies by institution. The "
            "following is a common example only, not a universal standard:\n"
            "  A  → 4.0  (85–100%)\n"
            "  B+ → 3.5  (80–84%)\n"
            "  B  → 3.0  (75–79%)\n"
            "  C+ → 2.5  (70–74%)\n"
            "  C  → 2.0  (65–69%)\n"
            "  D  → 1.0  (60–64%)\n"
            "  F  → 0.0  (below 60%)\n\n"
            "Formula: CGPA = Σ(Grade Points × Credit Hours) ÷ Total Credit Hours\n\n"
            "Always confirm your own university's official grading scale — the "
            "percentage bands and even the grade points can differ, and some "
            "universities use a relative (curved) system or still report results "
            "in percentages. If a scholarship or program lists a CGPA cutoff, use "
            "your institution's official conversion table."
        ),
    },

    {
        "slug": "admission-cycle-explained",
        "title": "What is an admission cycle / session?",
        "category": "concepts",
        "tags": ["admission cycle", "session", "fall", "spring", "intake"],
        "body": (
            "An admission cycle (also called an intake or session) is the period "
            "during which a university accepts applications for a specific academic "
            "term.\n\n"
            "Most Pakistani universities run two cycles per year:\n"
            "  Fall intake — applications typically open March–June, semester "
            "starts September.\n"
            "  Spring intake — applications typically open October–December, "
            "semester starts February.\n\n"
            "Not every program offers both intakes. Medical, engineering, and some "
            "professional programs often admit only once a year. Always check the "
            "specific program's open/closed status on ScholarBee rather than "
            "assuming a cycle exists."
        ),
    },

    {
        "slug": "open-merit-vs-self-finance",
        "title": "What is the difference between open merit and self-finance seats?",
        "category": "concepts",
        "tags": ["open merit", "self-finance", "seat category", "tuition"],
        "body": (
            "Universities split available seats into two main categories:\n\n"
            "Open Merit (Government Seats) — offered at subsidised tuition set by "
            "the government. Admission is purely on academic merit (aggregate score). "
            "Competition is higher and the number of seats is limited.\n\n"
            "Self-Finance (Private / Full-Fee Seats) — offered at the full "
            "commercial fee set by the university. Aggregate cutoffs are usually "
            "lower than open-merit, but you pay the market rate. Some universities "
            "also call these 'evening program' seats.\n\n"
            "Applying for both categories in the same form is common; you rank your "
            "preference and the system places you in the highest category your "
            "aggregate qualifies for."
        ),
    },

    {
        "slug": "what-is-aggregate",
        "title": "What is an aggregate score and how is it calculated?",
        "category": "concepts",
        "tags": ["aggregate", "merit score", "matric marks", "fsc marks", "entry test"],
        "body": (
            "An aggregate is a composite merit score a university calculates from "
            "your Matric, Intermediate, and entry-test results. Each component is "
            "given a weight. A common formula for engineering programs is:\n\n"
            "  Matric: 10%  +  FSc: 40%  +  Entry Test: 50% = Aggregate\n\n"
            "For medical (MBBS/BDS) admissions the merit weightage is set by PMDC "
            "and the admitting universities and has changed over time — always "
            "check the current official policy rather than relying on a past "
            "formula.\n\n"
            "Business schools may use a different split, such as Matric 10% + "
            "Inter 50% + Entry Test 40%.\n\n"
            "Every university publishes its own weightage — check the prospectus or "
            "program details page. Improving your entry-test score is usually the "
            "fastest way to raise your aggregate because it carries significant "
            "weight."
        ),
    },

    {
        "slug": "entry-test-types",
        "title": "What entry tests are required for different programs?",
        "category": "concepts",
        "tags": ["entry test", "MDCAT", "ECAT", "NTS", "GAT", "NAT", "HAT"],
        "body": (
            "Different programs require different standardised tests:\n\n"
            "MDCAT — Medical and Dental Colleges Admission Test. Required for MBBS, "
            "BDS, and allied health programs. Conducted by the Pakistan Medical & "
            "Dental Council (PMDC) annually.\n\n"
            "ECAT — Engineering Colleges Admission Test (Punjab). Required for BE/BSc "
            "Engineering in Punjab public universities.\n\n"
            "NTS NAT — NTS National Aptitude Test. Accepted by many universities for "
            "undergraduate admissions across disciplines.\n\n"
            "NTS GAT General — Graduate Assessment Test for master's-level admissions.\n\n"
            "NTS GAT Subject — For MS/MPhil in specific disciplines (sciences, "
            "engineering, management).\n\n"
            "HAT — HEC Aptitude Test for PhD admissions.\n\n"
            "University-specific tests — many universities run their own entry tests "
            "instead of or in addition to the above.\n\n"
            "Each program listing on ScholarBee shows which test is required and the "
            "minimum score accepted."
        ),
    },

    # =========================================================================
    # CATEGORY: admissions
    # =========================================================================

    {
        "slug": "general-admission-documents",
        "title": "What documents are required to apply for admission?",
        "category": "admissions",
        "tags": ["documents", "required", "matric certificate", "transcript", "CNIC", "domicile"],
        "body": (
            "The exact list varies by program and university, but these documents "
            "are required by almost every institution:\n\n"
            "1. Matric (SSC) certificate and detailed marks sheet (DMC)\n"
            "2. Intermediate (HSSC) certificate and detailed marks sheet\n"
            "3. Recent passport-size photographs (usually 2–4)\n"
            "4. CNIC (for applicants 18+) or B-form (for applicants under 18) — "
            "both sides\n"
            "5. Domicile certificate (province of residence)\n"
            "6. Character certificate from previous institution\n\n"
            "Depending on the program, you may also need:\n"
            "  - Entry test score card (MDCAT, ECAT, NTS, etc.)\n"
            "  - Hafiz-e-Quran certificate (for relevant quota seats)\n"
            "  - Disability certificate (for special seats)\n"
            "  - Sports or talent certificates\n"
            "  - Transfer certificate from previous institution (if applicable)\n\n"
            "Upload scanned copies; originals are verified during in-person "
            "enrollment after selection."
        ),
    },

    {
        "slug": "what-is-domicile",
        "title": "What is a domicile certificate and why is it needed?",
        "category": "admissions",
        "tags": ["domicile", "provincial quota", "residence", "certificate"],
        "body": (
            "A domicile certificate is an official document issued by the local "
            "government (Deputy Commissioner's office) that confirms your permanent "
            "province of residence.\n\n"
            "Why it matters for admissions: Public universities reserve a portion of "
            "seats for residents of the province in which the university is located "
            "(provincial quota). You must hold a domicile of that province to be "
            "eligible for those seats. Applying without the matching domicile means "
            "you can only compete for open/general seats.\n\n"
            "If you don't have a domicile yet, apply at your local DC office well "
            "before the admission deadline — it can take 2–4 weeks to process. You "
            "will need your family's CNIC, utility bills, and proof of residence."
        ),
    },

    {
        "slug": "character-certificate",
        "title": "What is a character certificate and how do I get one?",
        "category": "admissions",
        "tags": ["character certificate", "conduct", "school", "college"],
        "body": (
            "A character certificate is a document from your previous institution "
            "(school or college) confirming you were a student in good standing with "
            "no disciplinary issues. Almost all universities require it at the time "
            "of admission.\n\n"
            "How to get one: Visit the administration or exam branch of your last "
            "institution (where you completed Matric or Intermediate) and request a "
            "character certificate on the official letterhead. It should be signed "
            "by the principal and stamped. There is usually no fee, but processing "
            "can take a few days.\n\n"
            "If your institution has closed down, a certificate from a gazetted "
            "officer or district education officer is generally accepted."
        ),
    },

    {
        "slug": "admission-eligibility-bs",
        "title": "What are the eligibility criteria for a bachelor's (BS) program?",
        "category": "admissions",
        "tags": ["eligibility", "bachelor", "BS", "FSc", "minimum marks", "50%", "60%"],
        "body": (
            "Standard eligibility for a 4-year BS program in Pakistan:\n\n"
            "  - Intermediate (HSSC/FA/FSc/ICS/ICom or equivalent) with a minimum "
            "of 45–60% marks, depending on the university and discipline.\n"
            "  - The relevant subjects at Intermediate level matter: BSc Engineering "
            "and BS Physics typically require FSc Pre-Engineering (Physics, Math, "
            "Chemistry); MBBS requires FSc Pre-Medical (Biology, Chemistry, Physics); "
            "BCS/IT accepts both Pre-Eng and ICS (Math, Computer, Physics).\n"
            "  - A qualifying score on the required entry test (if applicable).\n"
            "  - Minimum 45% in Matric is sometimes separately required.\n\n"
            "Each program listing on ScholarBee states the exact minimum percentage "
            "and subject requirements — check before applying."
        ),
    },

    {
        "slug": "admission-eligibility-ms",
        "title": "What are the eligibility criteria for an MS / Master's program?",
        "category": "admissions",
        "tags": ["eligibility", "master", "MS", "CGPA", "16 years", "bachelor"],
        "body": (
            "Standard eligibility for MS/MPhil programs in Pakistan (HEC guidelines):\n\n"
            "  - A 4-year bachelor's (BS/BE/BBA etc.) or a 2-year master's (MA/MSc) "
            "after a 2-year bachelor's — together 16 years of education.\n"
            "  - Minimum CGPA of 2.0 out of 4.0 (some universities require 2.5).\n"
            "  - Qualifying score on NTS GAT General (50+) or the university's own "
            "entry test. Some universities accept GRE in lieu of GAT.\n"
            "  - Relevant bachelor's discipline — e.g., BS Computer Science for "
            "MS CS; BS Electrical Engineering for MS EE.\n\n"
            "Deficiency courses may be required if your undergraduate background "
            "does not fully align with the MS program."
        ),
    },

    {
        "slug": "admission-deadlines",
        "title": "What is an admission deadline and what happens if I miss it?",
        "category": "admissions",
        "tags": ["deadline", "last date", "closing date", "missed"],
        "body": (
            "An admission deadline is the last date and time by which your "
            "application (and usually your application fee) must be submitted. "
            "Universities do not accept applications after this date except in rare "
            "cases where a formal extension is announced.\n\n"
            "If you miss the deadline:\n"
            "  - Your application will not be processed for that cycle.\n"
            "  - You must wait for the next intake (typically 6 months later).\n"
            "  - Application fees paid before the deadline are generally "
            "non-refundable even if the admission is not offered.\n\n"
            "ScholarBee shows the closing date prominently on each program listing. "
            "Submit at least 2–3 days before the deadline to handle any technical "
            "issues with document uploads or fee payment."
        ),
    },

    {
        "slug": "quota-seats-explained",
        "title": "What are quota seats (sports, minority, disabled, Hafiz)?",
        "category": "admissions",
        "tags": ["quota", "sports quota", "minority", "disabled", "hafiz", "special seats"],
        "body": (
            "Pakistani public universities reserve a small percentage of seats for "
            "specific groups:\n\n"
            "Sports quota — for students with outstanding athletic achievement at "
            "district, provincial, or national level. Requires certificates from the "
            "relevant sports board.\n\n"
            "Minority quota — for students belonging to non-Muslim religious "
            "minorities. Usually 2–5% of seats.\n\n"
            "Disabled / Special persons quota — for students with certified "
            "disabilities. Requires a disability certificate issued by the "
            "provincial Social Welfare Department or the district disability "
            "assessment board.\n\n"
            "Hafiz-e-Quran quota — for students who have memorised the Quran. "
            "Requires a certificate from a recognised madrassa or examination board.\n\n"
            "Foreign / overseas quota — for students with foreign nationality or "
            "Pakistani origin living abroad.\n\n"
            "Applying for a quota seat does not remove you from the open-merit pool; "
            "you are considered for the best available seat."
        ),
    },

    {
        "slug": "merit-list-closing-merit",
        "title": "What is a merit list and what is closing merit?",
        "category": "admissions",
        "tags": ["merit list", "closing merit", "last merit", "aggregate cutoff", "selected"],
        "body": (
            "A merit list is a ranked list of applicants ordered by their aggregate "
            "score. Universities admit applicants from the top of the list until all "
            "available seats are filled.\n\n"
            "Closing merit (also called last merit) is the aggregate score of the "
            "last candidate offered a seat in that cycle. Anyone below that score "
            "was not selected.\n\n"
            "Merit lists are usually released in multiple rounds:\n"
            "  1st merit list — highest-scoring candidates.\n"
            "  2nd merit list — if some candidates from the 1st list decline, their "
            "seats open and a 2nd list is released.\n"
            "  Sometimes 3rd or supplementary lists follow.\n\n"
            "Closing merit shifts each year depending on total applicants, number of "
            "seats, and that year's exam results. Past closing merits give a guide "
            "but are not guarantees for future cycles."
        ),
    },

    # =========================================================================
    # CATEGORY: applying  (platform how-to)
    # =========================================================================

    {
        "slug": "how-to-create-account",
        "title": "How do I create an account on ScholarBee?",
        "category": "applying",
        "tags": ["register", "sign up", "create account", "new user"],
        "body": (
            "To create a ScholarBee account:\n\n"
            "1. Visit the ScholarBee website and click 'Register' or 'Create Account'.\n"
            "2. Enter your first name, last name, phone number, email address, and a strong password.\n"
            "3. Submit the form. ScholarBee sends a verification email to your registered email address.\n"
            "4. Open the email and confirm your account. If needed, use the resend option on the confirmation screen.\n"
            "5. Log in and continue to the platform.\n\n"
            "Use a personal email address you check regularly — application updates and password-reset links go there."
        ),
    },

    {
        "slug": "how-to-search-programs",
        "title": "How do I search for programs and universities on ScholarBee?",
        "category": "applying",
        "tags": ["search", "browse", "find program", "filter", "university list"],
        "body": (
            "ScholarBee lets you search for programs in several ways:\n\n"
            "Browse by university — use the 'Universities' section to find a "
            "specific institution and see all its open programs.\n\n"
            "Search by program name — type the degree or discipline (e.g., "
            "'MBBS', 'BS Computer Science', 'MBA') in the search bar.\n\n"
            "Filter by criteria — narrow results by city, province, program level "
            "(Bachelor's, Master's, PhD), discipline, or fee range.\n\n"
            "Check scholarship availability — you can filter programs that have "
            "active scholarships attached.\n\n"
            "Each program card shows the application deadline, available seats, "
            "tuition estimate, and required entry test so you can compare quickly "
            "before clicking through to the full details."
        ),
    },

    {
        "slug": "how-to-apply-step-by-step",
        "title": "How do I apply to a university program on ScholarBee?",
        "category": "applying",
        "tags": ["apply", "application", "step by step", "submit", "how to apply"],
        "body": (
            "Applying on ScholarBee uses a multi-step wizard:\n\n"
            "Step 1 — Personal Information\n"
            "Fill in your profile details before you continue.\n\n"
            "Step 2 — Contact Information\n"
            "Add your email, phone number, address, and domicile details.\n\n"
            "Step 3 — Educational Background\n"
            "Enter your academic history and marks.\n\n"
            "Step 4 — National ID Card\n"
            "Add or update your national ID card details if required.\n\n"
            "Step 5 — Choose Program\n"
            "Select the program you want to apply for.\n\n"
            "Step 6 — Final Submission / Fee Invoice\n"
            "Complete the final submission details and upload the fee invoice or deposit slip.\n\n"
            "Use the Apply Now button on a program page to start. If you reopen a draft from My Applications, ScholarBee takes you back to the saved stage."
        ),
    },

    {
        "slug": "can-i-apply-multiple-universities",
        "title": "Can I apply to more than one university at the same time?",
        "category": "applying",
        "tags": ["multiple applications", "more than one", "simultaneous", "different universities"],
        "body": (
            "Yes. ScholarBee allows you to apply to multiple universities and "
            "programs simultaneously from a single account. Each application is "
            "separate, which means:\n\n"
            "  - A separate application form must be completed for each program.\n"
            "  - A separate fee challan is generated for each university. You pay "
            "each university's fee independently.\n"
            "  - Submitting to one university does not affect your other applications.\n\n"
            "There is no platform-level limit on the number of applications you can "
            "submit, but check whether individual universities impose limits on how "
            "many programs you can apply to within that institution.\n\n"
            "Track all your applications from the 'My Applications' dashboard."
        ),
    },

    {
        "slug": "how-to-track-application-status",
        "title": "How do I check the status of my application?",
        "category": "applying",
        "tags": ["application status", "track", "my applications", "dashboard", "shortlisted", "selected"],
        "body": (
            "Go to 'My Applications' from your dashboard. Each application shows a "
            "status badge:\n\n"
            "Submitted — received and pending review by the university.\n\n"
            "Under Review — the university is verifying your documents and details.\n\n"
            "Shortlisted — you've met the initial criteria; further steps (written "
            "test, interview) may follow.\n\n"
            "Selected / Offered — you have been provisionally admitted. Follow "
            "the instructions to confirm your seat before the confirmation deadline.\n\n"
            "Waitlisted — you are in the reserve list; you may be offered a seat if "
            "a selected candidate does not confirm.\n\n"
            "Rejected — the university has not offered you a seat for this cycle.\n\n"
            "You will also receive an email notification whenever your status "
            "changes. Keep your email notifications enabled."
        ),
    },

    {
        "slug": "document-upload-requirements",
        "title": "What are the document upload requirements (file size, format)?",
        "category": "applying",
        "tags": ["upload", "file size", "PDF", "JPEG", "scan", "document format"],
        "body": (
            "When uploading documents on ScholarBee, follow these general rules:\n\n"
            "Format — PDF is preferred for certificates and transcripts. JPEG or "
            "PNG is accepted for photographs.\n\n"
            "File size — typically 1–2 MB per file. The upload field shows the "
            "exact limit. Compress large scans using a free tool like iLovePDF or "
            "Smallpdf before uploading.\n\n"
            "Clarity — scans must be legible. Blurry, cut-off, or dark images will "
            "be flagged during verification and can delay your application.\n\n"
            "Orientation — make sure the document is upright, not sideways.\n\n"
            "Do not upload password-protected PDFs.\n\n"
            "[Team: confirm the exact size limit per file and the full list of "
            "accepted formats for each document type.]"
        ),
    },

    {
        "slug": "can-i-edit-after-submission",
        "title": "Can I edit my application after submitting it?",
        "category": "applying",
        "tags": ["edit", "change", "update", "after submission", "mistake"],
        "body": (
            "In the current ScholarBee portal, only draft applications expose an Edit action in My Applications.\n\n"
            "Before final submission — you can open the wizard at your saved stage and change the form data.\n\n"
            "After submission — the Edit action is not shown for non-draft applications, so changes are no longer handled from the portal.\n\n"
            "If you need to correct a draft, use the Edit option from My Applications before final submission."
        ),
    },

    {
        "slug": "what-happens-after-selection",
        "title": "I've been selected / offered admission — what do I do next?",
        "category": "applying",
        "tags": ["selected", "offered", "confirm seat", "enrollment", "joining", "next steps"],
        "body": (
            "Congratulations. After receiving a selection offer, do these things "
            "promptly:\n\n"
            "1. Read the offer letter carefully — it will state the program, "
            "session, seat category (open merit / self-finance), tuition amount, "
            "and the deadline to confirm.\n\n"
            "2. Confirm your seat before the deadline — either by clicking "
            "'Accept Offer' on ScholarBee or by following the university's "
            "in-portal confirmation process. Seats not confirmed by the deadline "
            "are released to waitlisted candidates.\n\n"
            "3. Pay the admission / security deposit — most universities require "
            "an initial payment to hold your seat.\n\n"
            "4. Report for in-person enrollment — bring your original documents "
            "(all certificates, CNIC, domicile, photographs). The university will "
            "physically verify them.\n\n"
            "5. Complete registration for courses — done through the university's "
            "own student portal, not ScholarBee."
        ),
    },

    {
        "slug": "application-rejected-what-to-do",
        "title": "My application was rejected — what can I do?",
        "category": "applying",
        "tags": ["rejected", "not selected", "declined", "low aggregate", "next steps"],
        "body": (
            "A rejection means the university could not offer you a seat in this "
            "cycle, usually because your aggregate was below the closing merit or "
            "seats filled up. It does not mean you cannot apply again.\n\n"
            "Options after rejection:\n\n"
            "Apply to other open programs — if the deadline hasn't passed, apply "
            "to other universities or programs on ScholarBee.\n\n"
            "Wait for the next intake — most programs open again in 6 months.\n\n"
            "Improve your entry test score — retake the entry test and apply in "
            "the next cycle with a higher aggregate.\n\n"
            "Consider related programs — a slightly different discipline (e.g., "
            "BS Physics instead of BS EE) may have lower closing merit.\n\n"
            "There is typically no formal appeal process for merit-based rejections "
            "at public universities. Contact the university admissions office "
            "directly if you believe there was an error in merit calculation."
        ),
    },

    {
        "slug": "waitlist-explained",
        "title": "What does 'Waitlisted' mean and will I get a seat?",
        "category": "applying",
        "tags": ["waitlist", "waiting list", "reserve list", "probability"],
        "body": (
            "Being waitlisted means your aggregate qualified you to be a reserve "
            "candidate — you were close to the closing merit but all seats for your "
            "category were filled by higher-ranking applicants.\n\n"
            "Whether you receive a seat depends on how many selected candidates "
            "decline or fail to confirm their seat before the deadline. Waitlist "
            "movement is unpredictable and varies widely year to year.\n\n"
            "What to do while waitlisted:\n"
            "  - Keep checking your application status and email daily.\n"
            "  - Do not decline or ignore the waitlist status — you remain in "
            "consideration until the university closes the list.\n"
            "  - Apply to other programs in parallel (you can do this without "
            "withdrawing your waitlisted application).\n"
            "  - If offered a seat from the waitlist, respond immediately — the "
            "confirmation window is often very short (24–48 hours)."
        ),
    },

    # =========================================================================
    # CATEGORY: fees
    # =========================================================================

    {
        "slug": "what-is-application-fee",
        "title": "What is an application fee and how much is it?",
        "category": "fees",
        "tags": ["application fee", "admission fee", "how much", "fee amount"],
        "body": (
            "An application fee is a non-refundable processing charge that a "
            "university collects to review your admission application. It covers "
            "administrative costs and is charged regardless of whether you are "
            "admitted.\n\n"
            "Typical ranges at Pakistani universities:\n"
            "  Public universities  — Rs. 1,000–3,000 per application.\n"
            "  Private universities — Rs. 2,000–10,000 per application.\n\n"
            "The exact fee is displayed on each program's detail page on ScholarBee "
            "before you start the application. Fees are per university — if you "
            "apply to three universities, you pay three separate fees.\n\n"
            "Application fees are separate from tuition, enrollment fee, or the "
            "security deposit charged after selection."
        ),
    },

    {
        "slug": "what-is-fee-challan",
        "title": "What is a fee challan and how do I use it?",
        "category": "fees",
        "tags": ["challan", "fee challan", "bank", "payment slip", "deposit"],
        "body": (
            "A fee challan is a pre-printed bank deposit slip that ties your "
            "payment to your specific application. It ensures the bank and the "
            "university can match your payment to you automatically.\n\n"
            "How it works:\n"
            "1. After completing your application form, click 'Generate Challan'. "
            "A PDF is created with your name, application reference number, "
            "university name, amount, and bank details.\n"
            "2. Print the challan (three copies are typically provided — one for "
            "the bank, one for the university, one for you).\n"
            "3. Visit any branch of the designated bank listed on the challan. "
            "Pay in cash at the counter. Challans cannot be paid at ATMs or "
            "through inter-bank online transfer unless specifically stated.\n"
            "4. The bank stamps and signs all three copies and returns two to you.\n"
            "5. Scan the stamped bank copy and upload it to your application on "
            "ScholarBee as proof of payment.\n\n"
            "Do not pay before generating the challan — payments without a reference "
            "number cannot be matched to your application."
        ),
    },

    {
        "slug": "how-to-upload-payment-proof",
        "title": "How do I upload my fee payment proof?",
        "category": "fees",
        "tags": ["payment proof", "upload challan", "receipt", "bank stamp"],
        "body": (
            "After paying the application fee at the bank:\n\n"
            "1. Scan or photograph the bank-stamped challan or deposit slip clearly. Make sure the bank stamp, date, and transaction details are visible.\n"
            "2. Open the application you are working on and go to the Final Submission step.\n"
            "3. Fill in the deposit details shown on the form, then use the upload field labeled 'Upload Deposit Slip' / 'upload Fee Invoice'.\n"
            "4. Upload the scanned file. The form collects bank name, deposit date, deposited amount, branch address, and the uploaded fee invoice.\n"
            "5. Submit the form. Your payment details are then sent for verification, and the application can move forward once they are confirmed.\n\n"
            "If the file upload fails, re-check the file type and size before trying again."
        ),
    },

    {
        "slug": "application-fee-refund-policy",
        "title": "Can I get a refund on the application fee?",
        "category": "fees",
        "tags": ["refund", "fee refund", "cancel application", "money back"],
        "body": (
            "Application fees are generally non-refundable in Pakistan's university "
            "admissions system — this is standard practice across public and private "
            "institutions. Paying the fee does not guarantee admission; it only "
            "covers the cost of reviewing your application.\n\n"
            "Exceptions that sometimes apply:\n"
            "  - If you were charged in error (e.g., duplicate challan generated).\n"
            "  - If the university itself cancels the program or session.\n\n"
            "If you believe you are entitled to a refund due to a platform error, "
            "contact ScholarBee support within 48 hours of payment with your "
            "challan reference number and a description of the issue."
        ),
    },

    {
        "slug": "online-fee-payment",
        "title": "Can I pay the application fee online (Easypaisa, JazzCash, bank transfer)?",
        "category": "fees",
        "tags": ["online payment", "Easypaisa", "JazzCash", "transfer", "mobile wallet"],
        "body": (
            "Whether online payment is accepted depends on the individual university, "
            "not ScholarBee. Currently:\n\n"
            "Most public universities — require in-person payment at the designated "
            "bank counter using the printed challan. Online transfer to the same "
            "account number is often not accepted because it does not generate a "
            "machine-stamped receipt.\n\n"
            "Some private universities — accept EasyLoad, JazzCash, UBL Omni, "
            "or online bank transfer. The challan page will state whether online "
            "payment is an option and provide the exact account/merchant details.\n\n"
            "Always use the payment method listed on your specific challan. If you "
            "pay via a method not listed and it cannot be verified, your application "
            "fee may be lost.\n\n"
            "[Team: list universities on the platform that accept online payment and "
            "update this article accordingly.]"
        ),
    },

    # =========================================================================
    # CATEGORY: scholarships
    # =========================================================================

    {
        "slug": "types-of-scholarships",
        "title": "What types of scholarships are available on ScholarBee?",
        "category": "scholarships",
        "tags": ["scholarship types", "merit", "need", "government", "HEC", "private"],
        "body": (
            "ScholarBee lists scholarships across several categories:\n\n"
            "Merit-based — awarded for academic excellence (high CGPA or aggregate). "
            "No financial need component. Examples: Dean's List waivers, position "
            "holder discounts.\n\n"
            "Need-based — for students from low-income families. Requires proof of "
            "family income (Form B, father's salary slip or income affidavit). "
            "Examples: HEC Need-Based Scholarship, university hardship funds.\n\n"
            "Merit-cum-need — combines both criteria. Most HEC and government "
            "scholarship programs fall here.\n\n"
            "Government scholarships — funded by federal or provincial governments. "
            "Examples include the Benazir Undergraduate Scholarship (formerly the "
            "Ehsaas Undergraduate Scholarship, run by HEC), the PM Scholarship, and "
            "provincial schemes such as the Balochistan Scholarship.\n\n"
            "Institutional scholarships — offered by the university itself as tuition "
            "waivers or stipends.\n\n"
            "Corporate / NGO scholarships — offered by private companies or "
            "non-profit organizations for specific disciplines or regions.\n\n"
            "Each scholarship listing on ScholarBee states the type, eligibility, "
            "benefit amount, and deadline."
        ),
    },

    {
        "slug": "hec-need-based-scholarship",
        "title": "What is the HEC Need-Based Scholarship and who is eligible?",
        "category": "scholarships",
        "tags": ["HEC", "need-based", "government scholarship", "income", "federal"],
        "body": (
            "The HEC Need-Based Scholarship (NBS) is a federal program that pays "
            "full or partial tuition for financially disadvantaged students enrolled "
            "in recognized universities.\n\n"
            "Basic eligibility:\n"
            "  - Enrolled in an HEC-recognized university (public or private).\n"
            "  - Family income below Rs. 45,000 per month (threshold may be revised "
            "annually — verify on the HEC portal).\n"
            "  - CGPA of at least 2.0 (or equivalent) maintained each semester.\n"
            "  - Pakistani national.\n\n"
            "How to apply: Applications open through the HEC scholarship portal "
            "(hec.gov.pk). You will need your university enrollment letter, last "
            "semester transcript, family income proof, and CNIC. ScholarBee may "
            "link directly to the HEC portal for eligible students.\n\n"
            "Benefit: Tuition fee waiver (partial or full) paid directly to the "
            "university, plus a monthly stipend in some cases.\n\n"
            "Note: The closely related HEC undergraduate program — the Benazir "
            "Undergraduate Scholarship (formerly the Ehsaas Undergraduate "
            "Scholarship) — covers full tuition plus a stipend for newly admitted "
            "students in public-sector universities.\n\n"
            "Scholarship must be renewed each semester by maintaining academic "
            "requirements."
        ),
    },

    {
        "slug": "how-to-apply-scholarship",
        "title": "How do I apply for a scholarship on ScholarBee?",
        "category": "scholarships",
        "tags": ["apply scholarship", "scholarship application", "steps", "how to"],
        "body": (
            "To apply for a scholarship listed on ScholarBee:\n\n"
            "1. Log in and go to the 'Scholarships' section.\n"
            "2. Browse or search for scholarships matching your profile (level, "
            "discipline, province, income).\n"
            "3. Click on a scholarship and read the eligibility criteria carefully.\n"
            "4. If eligible, click 'Apply for Scholarship'.\n"
            "5. Complete the scholarship application form — this is separate from "
            "your program admission form but may pull data from your profile.\n"
            "6. Upload additional documents (income affidavit, CNIC of head of "
            "household, utility bills, recommendation letters if required).\n"
            "7. Submit. Track the scholarship application status from "
            "'My Scholarships' in your dashboard.\n\n"
            "Scholarship applications are separate from admission applications in the current portal. If you are applying for a scholarship tied to a university program, complete both flows as required by that listing."
        ),
    },

    {
        "slug": "scholarship-documents-required",
        "title": "What documents are needed for a scholarship application?",
        "category": "scholarships",
        "tags": ["scholarship documents", "income proof", "affidavit", "transcript", "need-based"],
        "body": (
            "Scholarship documents vary by type, but commonly required items are:\n\n"
            "For merit-based scholarships:\n"
            "  - Latest academic transcript / result card\n"
            "  - Enrollment confirmation from the university\n"
            "  - CNIC or B-form\n\n"
            "For need-based / merit-cum-need scholarships, add:\n"
            "  - Income affidavit (sworn statement of family income, attested by a "
            "Class-1 officer or notary)\n"
            "  - Father's/guardian's salary slip or proof of income\n"
            "  - Recent electricity, gas, or water bill\n"
            "  - Death certificate if father is deceased\n"
            "  - Family registration certificate (NADRA)\n\n"
            "For specific quota scholarships:\n"
            "  - Disability certificate, minority certificate, or other relevant proof.\n\n"
            "Upload clear, legible scans. Incomplete or blurry documents are the "
            "most common reason for scholarship application rejection."
        ),
    },

    {
        "slug": "scholarship-disbursement",
        "title": "How and when is scholarship money paid out?",
        "category": "scholarships",
        "tags": ["disbursement", "payment", "bank account", "stipend", "tuition waiver"],
        "body": (
            "Scholarship disbursement depends on the scholarship type:\n\n"
            "Tuition waiver — the scholarship is credited directly to your "
            "university fee account. You pay less (or nothing) when your semester "
            "fee is due. You do not receive cash.\n\n"
            "Monthly stipend — paid into your designated bank account each month "
            "during the academic year. You will need to provide a bank account "
            "number in your scholarship profile.\n\n"
            "One-time grant — a single payment made after enrollment confirmation, "
            "either to your bank account or as a fee adjustment.\n\n"
            "Timeline: Government scholarship funds are often released at the start "
            "of each semester. Delays of 1–2 months at semester start are common "
            "while HEC processes payments.\n\n"
            "If you believe a payment is late or incorrect, first contact your "
            "university's financial aid or scholarship office — they coordinate "
            "directly with HEC. ScholarBee support can assist if the issue is "
            "with the application record on the platform."
        ),
    },

    {
        "slug": "scholarship-renewal",
        "title": "Do I have to renew my scholarship every semester?",
        "category": "scholarships",
        "tags": ["renewal", "continue scholarship", "CGPA requirement", "semester", "maintain"],
        "body": (
            "Most ongoing scholarships require renewal each semester or academic "
            "year. Standard renewal conditions:\n\n"
            "  - Maintain the minimum CGPA specified (commonly 2.0–2.5 on a 4.0 scale).\n"
            "  - Be enrolled full-time (not on leave of absence).\n"
            "  - No disciplinary action on record.\n"
            "  - For need-based scholarships, re-confirm family income has not "
            "changed beyond the eligibility threshold.\n\n"
            "Renewal process: Submit an updated transcript and any required forms "
            "before the deadline stated in your scholarship award letter. Failure to "
            "renew on time or falling below the CGPA threshold can suspend your "
            "scholarship for that semester."
        ),
    },

    # =========================================================================
    # CATEGORY: account
    # =========================================================================

    {
        "slug": "forgot-password",
        "title": "I forgot my password — how do I reset it?",
        "category": "account",
        "tags": ["forgot password", "reset", "login", "can't log in"],
        "body": (
            "To reset your ScholarBee password:\n\n"
            "1. Go to the login page and click 'Forgot Password'.\n"
            "2. Enter the email address linked to your account.\n"
            "3. ScholarBee sends a password-reset link to that email. Check your spam folder if it doesn't appear within a few minutes.\n"
            "4. Open the link and enter a new password.\n"
            "5. Log in with your new password. If you need the email again, use the resend option on the confirmation screen after the cooldown ends."
        ),
    },

    {
        "slug": "how-to-update-profile",
        "title": "How do I update my personal information or academic records on my profile?",
        "category": "account",
        "tags": ["edit profile", "update info", "change details", "marks", "phone number"],
        "body": (
            "To update your ScholarBee profile:\n\n"
            "1. Log in and open 'Profile Information' from the profile sidebar.\n"
            "2. Click 'Edit'.\n"
            "3. Update the fields shown in the form. The profile screen supports personal details, contact information, domicile, address, and profile photo.\n"
            "4. Click 'Update' to save your changes.\n"
            "5. If you cancel, the form reverts to the last saved data.\n\n"
            "If a field is not shown on the profile form, the current platform does not expose it for editing there."
        ),
    },

    {
        "slug": "how-to-enable-notifications",
        "title": "How do I turn on/off notifications and email alerts?",
        "category": "account",
        "tags": ["notifications", "email alerts", "SMS", "push notification", "settings"],
        "body": (
            "ScholarBee currently delivers notifications in-app through its notification socket. The current UI does not show a notification preferences screen, so you cannot turn email, SMS, or in-app alerts on or off from the portal.\n\n"
            "If notifications seem delayed or missing, refresh the page, sign out and back in, or contact support."
        ),
    },

    {
        "slug": "how-to-delete-account",
        "title": "How do I delete my ScholarBee account?",
        "category": "account",
        "tags": ["delete account", "close account", "remove data", "privacy"],
        "body": (
            "ScholarBee does not currently provide a self-service account deletion option in the platform. If you want to step away, you can simply stop using the account or log out.\n\n"
            "If you need help with your account or want to discuss data or privacy concerns, use the Contact Us page, email info@scholarbee.pk, or call +92 325 555 9699. Include your registered name and email address so support can identify your account."
        ),
    },

    {
        "slug": "can-i-have-two-accounts",
        "title": "Can I have two accounts with the same CNIC?",
        "category": "account",
        "tags": ["duplicate account", "two accounts", "same CNIC", "multiple accounts"],
        "body": (
            "No. ScholarBee uses your CNIC (or B-form for minors) as a unique "
            "identifier. The system will detect and flag duplicate accounts sharing "
            "the same identity document.\n\n"
            "If you accidentally created two accounts and cannot log in to the "
            "correct one, contact support with your CNIC number and we will merge "
            "or recover the right account.\n\n"
            "Do not try to re-register if you have forgotten your password — use "
            "the 'Forgot Password' flow instead."
        ),
    },

    # =========================================================================
    # CATEGORY: support
    # =========================================================================

    {
        "slug": "how-to-contact-support",
        "title": "How do I contact ScholarBee support?",
        "category": "support",
        "tags": ["contact", "support", "help", "email", "helpdesk", "complaint"],
        "body": (
            "You can reach ScholarBee support through:\n\n"
            "Call Us — +92 325 555 9699\n\n"
            "Email Us — info@scholarbee.pk\n\n"
            "Open Chat — use the support chat entry on the Contact Us page.\n\n"
            "For university-specific questions (admission criteria, fee structure beyond the application fee, hostel availability), contact the university admissions office directly. Their contact details are on each university's page within ScholarBee."
        ),
    },

    {
        "slug": "technical-issue-during-application",
        "title": "I'm having a technical issue while applying (page error, upload failing, form not saving)",
        "category": "support",
        "tags": ["technical issue", "error", "upload failed", "not saving", "bug", "browser"],
        "body": (
            "If you encounter a technical problem during your application:\n\n"
            "1. Refresh the page and try again. If you were mid-form, most data "
            "auto-saves — check if your entries are still there.\n"
            "2. Try a different browser (Chrome or Firefox are recommended). "
            "Safari and Internet Explorer occasionally cause display issues.\n"
            "3. Clear your browser cache and cookies, then reload.\n"
            "4. For upload errors — check the file size and format. Reduce the "
            "file size with a compression tool if needed.\n"
            "5. If the problem persists, screenshot the error message and contact "
            "ScholarBee support. Include your application reference number and the "
            "browser/device you are using.\n\n"
            "If your application deadline is very close, mention that explicitly in "
            "your support message so the team can prioritise."
        ),
    },

    {
        "slug": "university-contact-info",
        "title": "How do I find a university's contact information?",
        "category": "support",
        "tags": ["university contact", "phone", "email", "address", "admissions office"],
        "body": (
            "Each university listed on ScholarBee has a dedicated profile page that "
            "includes:\n\n"
            "  - Official website link\n"
            "  - Admissions office email\n"
            "  - Phone number\n"
            "  - Physical address and campus map\n\n"
            "To find it: open any program from that university and click the "
            "university name/logo at the top of the listing. This takes you to the "
            "university profile page.\n\n"
            "For questions about specific admission criteria, interview schedules, "
            "hostel capacity, or fee breakdowns beyond the application fee — contact "
            "the university directly. ScholarBee can help you with the application "
            "process but cannot answer institution-specific operational queries on "
            "behalf of universities."
        ),
    },

]