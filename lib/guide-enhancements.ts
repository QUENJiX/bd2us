export type GuideEnhancement = {
  beginner: string;
  vocabulary: string[];
  deeper: string[];
  bangladesh: string;
  communityInsight: string;
  mistakes: string[];
  worksheetTitle: string;
  worksheetItems: string[];
};

export const guideEnhancements: Record<string, GuideEnhancement> = {
  orientation: {
    beginner: "A U.S. application is not one form. It is a year-long project that combines college research, academics, recommendations, activities, essays, financial-aid forms, and—after admission—visa and travel work.",
    vocabulary: ["Demonstrated need", "Need-aware", "Need-blind"],
    deeper: ["Start with constraints before prestige: annual family contribution, academic interests, testing access, and the kind of campus where you can thrive.", "Build redundancy. Your plan should still work if a test date is cancelled, a recommendation is late, or a highly selective college says no."],
    bangladesh: "Discuss money in BDT and USD with your family now. Include exchange-rate risk, airfare, visa costs, health insurance, winter clothing, and expenses during university breaks—not only tuition.",
    communityInsight: "Experienced applicants repeatedly describe uncertainty as the hardest part. A written system reduces anxiety better than collecting more random advice.",
    mistakes: ["Beginning with a dream-school list before discussing affordability", "Treating every internet success story as a template", "Waiting for applications to open before organizing documents"],
    worksheetTitle: "One-page starting brief",
    worksheetItems: ["Target intake and current curriculum", "Family’s sustainable annual contribution range", "Three academic interests to explore", "Testing access and likely dates", "The next two actions you can finish this week"]
  },
  timeline: {
    beginner: "Work backward from enrollment in August 2027. Your real deadlines begin months before application submission because tests, school documents, essays, and financial forms depend on other people and systems.",
    vocabulary: ["Deferral", "Waitlist"],
    deeper: ["Use internal deadlines at least seven days earlier than official deadlines. For counselor and teacher materials, create even more buffer.", "Track application and aid deadlines separately. A submitted Common App does not mean the financial-aid file is complete."],
    bangladesh: "Map school exams, Eid holidays, board-result timing, coaching schedules, and counselor availability. SSC/HSC and O/A Level calendars do not naturally align with U.S. admission workflows.",
    communityInsight: "Applicants who finish strong applications early usually protect revision time; they do not necessarily submit the first draft early.",
    mistakes: ["Using only official deadlines", "Scheduling the first SAT too late for a useful retake", "Assuming recommendations can be requested a few days before submission"],
    worksheetTitle: "Fall 2027 master calendar",
    worksheetItems: ["August–September: budget, research, testing, activity evidence", "October–November: essays, recommendations, early applications", "December–January: regular applications and aid forms", "February–April: portals, updates, interviews, decisions", "May–August: enrollment, I-20, visa, travel, arrival"]
  },
  "college-research": {
    beginner: "A balanced list is a set of colleges that fit your academics, interests, finances, and preferences. It is not a ranking copied from the internet.",
    vocabulary: ["Need-aware", "Need-blind", "Demonstrated need"],
    deeper: ["Separate admission selectivity from financial selectivity. A college can be academically accessible but financially unrealistic for an international applicant.", "Use the 678-college explorer to find leads, then verify current policies and build your own evidence for each shortlist decision."],
    bangladesh: "For applicants needing substantial aid, every final list needs multiple funding routes: colleges that meet need, realistic merit possibilities, lower-cost options, and a sustainable non-U.S. backup.",
    communityInsight: "Admissions professionals consistently warn that there is no true safety when a highly selective international applicant needs major funding.",
    mistakes: ["Calling a college a safety from its overall acceptance rate", "Ignoring indirect cost and annual price increases", "Researching campus culture only through promotional pages"],
    worksheetTitle: "College research worksheet",
    worksheetItems: ["Academic fit and intended-major evidence", "Four-year cost and verified international-aid route", "Testing, English, application, and aid deadlines", "Campus setting, size, housing, and international support", "One reason to keep it and one reason to remove it"]
  },
  academics: {
    beginner: "Colleges read your results in the context of your school and curriculum. Your task is to submit accurate records and make that context understandable—not to manufacture a U.S. GPA.",
    vocabulary: ["Superscoring"],
    deeper: ["Rigor means using the opportunities actually available to you. A reader should understand subject choices, grading scale, predicted grades, and constraints.", "Recommendations add evidence about how you learn and contribute. Give teachers time and useful context without scripting their letters."],
    bangladesh: "Confirm how SSC/HSC marksheets, O/A Level statements, predicted grades, transcripts, translations, and school profiles will be uploaded. Many schools need a clear process long before deadlines.",
    communityInsight: "Readers commonly emphasize trajectory and context. One result rarely explains the full academic story.",
    mistakes: ["Self-converting grades without being asked", "Uploading unofficially altered documents", "Choosing recommenders only because of their title"],
    worksheetTitle: "Academic document audit",
    worksheetItems: ["All available transcripts and examination results", "Predicted grades and expected release dates", "School grading scale and curriculum explanation", "Translation requirements", "Counselor and recommender submission plan"]
  },
  "standardized-testing": {
    beginner: "Testing is evidence, not your identity. Decide whether a score strengthens the application, then verify each college’s Fall 2027 policy before registering or submitting.",
    vocabulary: ["Superscoring"],
    deeper: ["A test-optional policy does not automatically answer whether you should submit. Compare your score with the rest of your academic evidence and the college’s published context.", "English-proficiency rules are separate from SAT/ACT rules. Waivers often depend on language of instruction, curriculum, or years studied."],
    bangladesh: "Plan around seat availability, travel to a test center, payment access, school exams, and score-reporting time. Keep a backup English-test route where possible.",
    communityInsight: "High scorers often improve through error analysis and repeated timed practice, not by collecting more preparation resources.",
    mistakes: ["Assuming test-optional means scores never matter", "Registering for repeated tests without a specific improvement plan", "Missing English-test or waiver requirements"],
    worksheetTitle: "Testing decision sheet",
    worksheetItems: ["Current score and section-level weaknesses", "Next test date and registration deadline", "College-by-college policy and superscore rule", "English test or waiver evidence", "A final score-submission decision date"]
  },
  activities: {
    beginner: "Activities show how you spend time, take responsibility, solve problems, and contribute. You do not need ten prestigious titles.",
    vocabulary: ["Activities list"],
    deeper: ["Impact can be human, technical, artistic, academic, financial, or familial. Quantify outcomes only when the numbers are honest and meaningful.", "A coherent profile is not a manufactured theme. It is the pattern a reader can see across your interests, choices, and contribution."],
    bangladesh: "Family work, tutoring, caregiving, religious/community roles, independent projects, and responsibilities outside formal clubs can be significant. Explain context so a U.S. reader understands the commitment.",
    communityInsight: "Admissions readers repeatedly distinguish sustained contribution from last-minute résumé padding.",
    mistakes: ["Starting a superficial organization only for applications", "Using vague verbs without responsibilities or outcomes", "Ignoring family and paid-work commitments"],
    worksheetTitle: "Activities evidence log",
    worksheetItems: ["Role, organization, dates, and hours", "What you actually did each week", "Who benefited and how", "A specific result, work sample, or lesson", "A concise 150-character description draft"]
  },
  essays: {
    beginner: "An essay helps a reader understand how you notice, think, choose, and change. It is not a formal speech or a list of achievements.",
    vocabulary: ["Personal statement"],
    deeper: ["Specific scenes create credibility. Reflection explains why the scene matters. Strong drafts balance both.", "Supplemental essays should connect your interests and habits to real opportunities at the college without copying its website language."],
    bangladesh: "Do not flatten local experiences for an American reader. Explain only the context they need, keep culturally specific details, and translate the meaning rather than erasing it.",
    communityInsight: "Essay advisers consistently recommend separating drafting from editing and asking feedback readers what they learned about you—not whether the essay sounds impressive.",
    mistakes: ["Letting an adult or AI replace your voice", "Writing only about the lesson without a concrete story", "Using the same generic ‘Why us?’ answer everywhere"],
    worksheetTitle: "Essay revision checklist",
    worksheetItems: ["A specific opening situation rather than a thesis", "Details only you could truthfully write", "Reflection that reveals thought or change", "Every sentence sounds like your natural voice", "A final integrity and proofreading pass"]
  },
  "application-platforms": {
    beginner: "The application platform is a delivery system. Your job is to keep every field, document, waiver, supplement, and portal status accurate across every college.",
    vocabulary: ["Fee waiver"],
    deeper: ["Preview the rendered application before submitting. Formatting, activity order, testing entries, and uploaded documents can look different from the editor.", "After submission, the college portal—not the Common App dashboard—usually becomes the source of truth for missing materials."],
    bangladesh: "Confirm card/payment access and fee-waiver procedures early. Coordinate school submissions across time zones and save PDF previews, receipts, and confirmation emails.",
    communityInsight: "Many avoidable problems come from rushed logistics rather than weak content: wrong rounds, unfinished supplements, and unchecked portals.",
    mistakes: ["Submitting in the final hour", "Assuming a platform fee waiver automatically covers every college", "Forgetting separate portfolios or financial forms"],
    worksheetTitle: "Submission audit",
    worksheetItems: ["Correct college, program, campus, and application round", "All writing reviewed in the final PDF", "Recommendations and school forms assigned", "Fee or approved waiver confirmed", "Portal login and submission receipt saved"]
  },
  "financial-aid": {
    beginner: "The price on a college website is not necessarily what your family will pay. International aid depends on each institution’s policy, forms, calculation, and available funding.",
    vocabulary: ["Demonstrated need", "Need-aware", "Need-blind", "SAI", "EFC"],
    deeper: ["Need-blind admission and meeting full demonstrated need are separate promises. Confirm both for international applicants.", "Compare grants, scholarships, loans, work expectations, billed costs, travel, insurance, and annual renewal conditions—not only the first-year headline award."],
    bangladesh: "Prepare consistent BDT and USD records for income, savings, property, business ownership, taxes or non-filing explanations, and unusual family circumstances. Explain documents that do not have a direct U.S. equivalent.",
    communityInsight: "International applicants often report that documentation and policy interpretation—not the form itself—create the biggest difficulty. Ask the college when instructions conflict.",
    mistakes: ["Using a net-price calculator as a guaranteed international offer", "Hiding or inconsistently reporting assets", "Applying to an unaffordable list with no funding backup"],
    worksheetTitle: "Financial-aid document file",
    worksheetItems: ["Family contribution range agreed in writing", "Income and employment records", "Bank, savings, property, and business documents", "CSS Profile or institutional-form requirements", "College-specific aid deadlines and portal status"]
  },
  decisions: {
    beginner: "An admission letter is only one part of the decision. Compare the complete offer, conditions, academic fit, and four-year affordability before paying a deposit.",
    vocabulary: ["Deferral", "Waitlist", "Demonstrated need"],
    deeper: ["Normalize every offer into the same annual categories: grants, scholarships, loans, work, billed charges, indirect costs, and family contribution.", "An appeal should present new or misunderstood financial evidence, a competing comparable offer where appropriate, or a material change—not simply ask for more money."],
    bangladesh: "Model exchange-rate changes and the cost of travel home. Confirm whether aid and scholarships renew, how future income is reviewed, and what happens if your family’s circumstances change.",
    communityInsight: "Students often regret optimizing for name recognition while underweighting debt, support, curriculum flexibility, or personal fit.",
    mistakes: ["Comparing awards instead of net four-year cost", "Paying multiple deposits without understanding policies", "Treating a waitlist as the primary plan"],
    worksheetTitle: "Offer comparison worksheet",
    worksheetItems: ["Net billed cost after grants and scholarships", "Travel, insurance, books, and personal expenses", "Renewal terms and future price increases", "Academic and personal fit evidence", "Questions to resolve before the reply deadline"]
  },
  visa: {
    beginner: "After choosing a college, follow its instructions to receive the I-20, pay the SEVIS fee, complete the DS-160, schedule the interview, and prepare consistent documents.",
    vocabulary: ["I-20", "SEVIS"],
    deeper: ["The amounts and funding sources on your I-20, aid offer, bank documents, and interview explanation should make sense together.", "Interview preparation is not memorizing a script. Practice short, truthful answers about your program, college choice, funding, and study plan."],
    bangladesh: "Use only the U.S. embassy, Department of State, SEVIS, and your college’s international office for current instructions. Appointment availability and procedures can change quickly.",
    communityInsight: "Students describe organization and consistency as more useful than rehearsed dramatic answers.",
    mistakes: ["Using unofficial agents as the final authority", "Submitting inconsistent names, dates, or funding figures", "Buying nonrefundable travel before understanding visa timing"],
    worksheetTitle: "Visa document folder",
    worksheetItems: ["Passport and admission/enrollment records", "Signed I-20 and SEVIS payment receipt", "DS-160 confirmation and appointment instructions", "Aid offer and credible financial evidence", "Academic records and concise study-plan notes"]
  },
  arrival: {
    beginner: "Arrival planning covers immigration documents, housing, money, health, connectivity, weather, orientation, and the first practical week—not only packing.",
    vocabulary: ["I-20", "SEVIS", "Nonresident alien"],
    deeper: ["Keep essential documents and one change of clothes in your carry-on. Know the earliest entry date and follow the college’s travel guidance.", "Learn before opening financial accounts or completing tax forms. International-student status can change which forms and rules apply."],
    bangladesh: "Plan for long travel, time-zone adjustment, U.S. electrical standards, prescription documentation, winter weather, and a reliable way to access money before a bank account is active.",
    communityInsight: "Students living away from home consistently emphasize practical routines—sleep, laundry, food, medication, budgeting, and asking for help—over buying an enormous packing list.",
    mistakes: ["Packing important documents in checked luggage", "Buying everything before seeing the room", "Skipping international orientation or immigration check-in"],
    worksheetTitle: "Arrival and first-week checklist",
    worksheetItems: ["Carry-on document and medication folder", "Housing, airport, and emergency contacts", "First 72-hour money and connectivity plan", "International check-in and orientation schedule", "Health, banking, transport, laundry, and food setup"]
  }
};
