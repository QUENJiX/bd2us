import type {
  College,
  GuideEntry,
  OfficialResource,
  RoadmapStage,
  RoadmapTask,
  SearchResult,
  Source,
  StudentProfile
} from "@/lib/types";
import { blogs } from "@/lib/blog-content";
import { guideContent, guideSources } from "@/lib/guide-content";
import { glossary } from "@/lib/glossary";
import generatedCollegeCatalog from "@/lib/college-catalog.generated.json";

export { blogs } from "@/lib/blog-content";

export const verifiedOn = "2026-08-01";

const source = (label: string, url: string): Source => ({
  label,
  url,
  lastVerifiedAt: verifiedOn
});

const guideBlueprints: Array<{
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  takeaways: string[];
  taskIds: string[];
}> = [
  {
    slug: "orientation",
    title: "Start with the whole map, not a dream-school logo",
    eyebrow: "01 · Orientation",
    summary:
      "Understand the actual journey: academic fit, affordability, application quality, and the practical steps after admission.",
    takeaways: [
      "Affordability is a first-order constraint, not a final check.",
      "Your plan should cover research, applications, aid, visa preparation, and arrival.",
      "Strong applications are built through steady work, not a last-minute sprint."
    ],
    taskIds: ["orient-costs", "orient-path"]
  },
  {
    slug: "timeline",
    title: "Build your Bangladesh-specific application timeline",
    eyebrow: "02 · Timeline",
    summary:
      "Translate SSC/HSC, O/A Level, gap-year, testing, and application windows into a plan you can actually follow.",
    takeaways: [
      "Work backward from your target August intake.",
      "Reserve time for counselor documents and financial-aid forms.",
      "Treat a gap year as a structured opportunity with clear outcomes."
    ],
    taskIds: ["timeline-intake", "timeline-calendar"]
  },
  {
    slug: "college-research",
    title: "Research colleges through fit and funding",
    eyebrow: "03 · College Research",
    summary:
      "Build a deliberate list using official sources, international-aid policies, academic interests, and honest budget constraints.",
    takeaways: [
      "Verify every changing policy on the official college website.",
      "Separate need-blind, need-aware, and merit-focused options.",
      "Do not label any highly selective U.S. college a safety."
    ],
    taskIds: ["research-list", "research-compare"]
  },
  {
    slug: "academics",
    title: "Present your academics in context",
    eyebrow: "04 · Academics",
    summary:
      "Organize transcripts, predicted grades, school context, recommendations, and counselor coordination across Bangladeshi curricula.",
    takeaways: [
      "Do not invent a U.S. GPA conversion unless a college asks for one.",
      "Ask your school early about transcript and recommendation workflows.",
      "Explain context clearly when your curriculum or school resources need interpretation."
    ],
    taskIds: ["academics-docs", "academics-counselor"]
  },
  {
    slug: "standardized-testing",
    title: "Plan testing without wasting time or money",
    eyebrow: "05 · Testing",
    summary:
      "Choose a sensible SAT or ACT strategy, verify each college policy, and decide which English-proficiency test fits your list.",
    takeaways: [
      "Testing policies can change by admission cycle.",
      "A score is useful when it strengthens the academic evidence in your application.",
      "Check English-test waivers and accepted exams college by college."
    ],
    taskIds: ["testing-policy", "testing-plan"]
  },
  {
    slug: "activities",
    title: "Turn activities into a record of contribution",
    eyebrow: "06 · Activities",
    summary:
      "Focus on sustained contribution, initiative, and results rather than collecting shallow memberships.",
    takeaways: [
      "Depth, consistency, and impact matter more than an inflated activity count.",
      "Keep a simple evidence log of outcomes and responsibilities.",
      "Use your limited application space to make your contribution easy to understand."
    ],
    taskIds: ["profile-inventory", "profile-evidence"]
  },
  {
    slug: "essays",
    title: "Write essays that sound unmistakably like you",
    eyebrow: "07 · Essays",
    summary:
      "Develop personal statements and supplements through reflection, specific detail, revision, and ethical use of feedback tools.",
    takeaways: [
      "A clear, specific story usually beats an over-engineered performance.",
      "Use AI for questions and feedback, never to fabricate your voice or experiences.",
      "Draft early enough to revise with distance."
    ],
    taskIds: ["essays-story", "essays-supplements"]
  },
  {
    slug: "application-platforms",
    title: "Control the submission workflow",
    eyebrow: "08 · Applications",
    summary:
      "Track platforms, forms, fee waivers, supporting documents, and submission checks without letting small logistics derail your work.",
    takeaways: [
      "Keep one source of truth for each college and deadline.",
      "Confirm fee-waiver routes before paying unnecessarily.",
      "Submit before the final hour and save confirmation records."
    ],
    taskIds: ["apply-platforms", "apply-submit"]
  },
  {
    slug: "financial-aid",
    title: "Treat financial aid as a documented strategy",
    eyebrow: "09 · Financial Aid",
    summary:
      "Understand CSS Profile, ISFAA alternatives, affordability comparisons, and how to ask for a review when circumstances are misunderstood.",
    takeaways: [
      "Each institution calculates demonstrated need using its own methodology.",
      "A planning estimate is not a financial-aid offer.",
      "Compare the full annual cost after grants, work expectations, travel, and insurance."
    ],
    taskIds: ["aid-budget", "aid-documents"]
  },
  {
    slug: "decisions",
    title: "Compare offers with a calm head",
    eyebrow: "10 · Decisions",
    summary:
      "Handle admission, denial, deferral, and waitlist outcomes while comparing affordability and academic fit responsibly.",
    takeaways: [
      "Read every aid offer line by line.",
      "Ask for clarification or a review when new evidence matters.",
      "Make a decision your family can sustain for four years."
    ],
    taskIds: ["decision-compare", "decision-respond"]
  },
  {
    slug: "visa",
    title: "Move from acceptance to your visa interview",
    eyebrow: "11 · Visa",
    summary:
      "Track enrollment, I-20 issuance, SEVIS payment, DS-160 completion, interview preparation, and required documents.",
    takeaways: [
      "Follow the instructions from your enrolled college and official U.S. government sources.",
      "Keep names, dates, and financial information consistent across documents.",
      "Practice explaining your study plan clearly and honestly."
    ],
    taskIds: ["visa-i20", "visa-interview"]
  },
  {
    slug: "arrival",
    title: "Prepare for departure and your first week",
    eyebrow: "12 · Arrival",
    summary:
      "Close the loop with travel documents, packing, connectivity, banking, orientation, and the first practical steps after landing.",
    takeaways: [
      "Keep essential documents and first-day items in your carry-on.",
      "Follow your college's international-student orientation instructions.",
      "Expect adjustment to take time; ask for support early."
    ],
    taskIds: ["arrival-docs", "arrival-first-week"]
  }
];

export const guides: GuideEntry[] = guideBlueprints.map((guide, index) => ({
  slug: guide.slug,
  order: index + 1,
  title: guide.title,
  eyebrow: guide.eyebrow,
  summary: guide.summary,
  readMinutes: 6 + (index % 4),
  lastVerifiedAt: verifiedOn,
  reviewStatus: "published",
  takeaways: guide.takeaways,
  blocks: guideContent[guide.slug] ?? [],
  sources: guideSources[guide.slug] ?? [],
  relatedTaskIds: guide.taskIds,
  nextSlug: guideBlueprints[index + 1]?.slug
}));

const taskBlueprints: Array<[string, string, string, string, string, string, "Core" | "Recommended"]> = [
  ["orient-costs", "orientation", "Understand your cost ceiling", "Discuss a sustainable annual contribution range with your family.", "Before serious college research", "orientation", "Core"],
  ["orient-path", "orientation", "Map the full journey", "Review the stages from research through arrival and identify your current stage.", "This week", "orientation", "Core"],
  ["timeline-intake", "timeline", "Choose a target intake", "Select the August intake you are planning for and work backward from it.", "As early as possible", "timeline", "Core"],
  ["timeline-calendar", "timeline", "Create your master calendar", "Add testing, application, aid, and school-document windows.", "At least 12 months before enrollment", "timeline", "Core"],
  ["research-list", "research", "Build a first-pass college list", "Start with institutions that make sense for your budget and interests.", "Before essay season", "college-research", "Core"],
  ["research-compare", "research", "Verify your shortlist", "Compare official aid pages, application plans, testing policies, and fit notes.", "Before finalizing applications", "college-research", "Core"],
  ["academics-docs", "academics", "Audit academic records", "List transcripts, predicted grades, translations, and school-profile context you need.", "Before asking your school to submit documents", "academics", "Core"],
  ["academics-counselor", "academics", "Coordinate with your school", "Agree on a practical recommendation and document-submission timeline.", "Several weeks before deadlines", "academics", "Core"],
  ["testing-policy", "testing", "Check testing requirements", "Verify SAT or ACT and English-proficiency policies for every shortlisted college.", "Before test registration", "standardized-testing", "Core"],
  ["testing-plan", "testing", "Plan your test dates", "Choose preparation windows and leave room for a retake only if useful.", "Before application season", "standardized-testing", "Recommended"],
  ["profile-inventory", "profile", "Inventory your activities", "Capture responsibilities, time spent, outcomes, and what you learned.", "Before filling applications", "activities", "Core"],
  ["profile-evidence", "profile", "Keep an evidence log", "Save concise notes and links for projects, awards, and contribution claims.", "Ongoing", "activities", "Recommended"],
  ["essays-story", "essays", "Draft your personal statement", "Start with real moments, not a polished performance.", "Before supplement season", "essays", "Core"],
  ["essays-supplements", "essays", "Track supplemental essays", "Group prompts, research colleges, and revise for specificity.", "Before each submission", "essays", "Core"],
  ["apply-platforms", "applications", "Create your submission tracker", "List portals, forms, recommendation status, and fee-waiver routes.", "Before applications open", "application-platforms", "Core"],
  ["apply-submit", "applications", "Run a final submission check", "Preview each application, verify attachments, submit early, and save confirmation.", "Before every deadline", "application-platforms", "Core"],
  ["aid-budget", "aid", "Model your budget range", "Estimate a contribution band and separate billed costs from travel and personal expenses.", "Before finalizing your list", "financial-aid", "Core"],
  ["aid-documents", "aid", "Prepare financial-aid records", "Confirm CSS Profile or alternative forms and gather supporting documentation.", "Before aid deadlines", "financial-aid", "Core"],
  ["decision-compare", "decisions", "Compare offers", "Review grants, work expectations, indirect costs, and four-year affordability.", "When decisions arrive", "decisions", "Core"],
  ["decision-respond", "decisions", "Respond intentionally", "Handle deposits, waitlists, and declined offers before their deadlines.", "By each college's reply date", "decisions", "Core"],
  ["visa-i20", "visa", "Complete I-20 and SEVIS steps", "Follow your enrolled college's instructions and official government guidance.", "After enrollment", "visa", "Core"],
  ["visa-interview", "visa", "Prepare for your visa interview", "Organize documents and practice clear, honest answers about your study plan.", "Before your interview", "visa", "Core"],
  ["arrival-docs", "arrival", "Prepare your travel folder", "Keep passport, visa, I-20, contacts, and arrival details accessible.", "Before departure", "arrival", "Core"],
  ["arrival-first-week", "arrival", "Plan your first week", "Review orientation, connectivity, banking, and campus check-in steps.", "Before departure", "arrival", "Recommended"]
];

export const roadmapTasks: RoadmapTask[] = taskBlueprints.map(
  ([id, stageId, title, description, dueHint, guideSlug, priority]) => ({
    id,
    stageId,
    title,
    description,
    dueHint,
    guideSlug,
    priority
  })
);

export const roadmapStages: RoadmapStage[] = [
  ["orientation", "Get oriented", "Start with the full map and a realistic family budget.", "#0f766e"],
  ["timeline", "Set your timeline", "Work backward from your target intake and school calendar.", "#0369a1"],
  ["research", "Research colleges", "Build a source-backed list around affordability and fit.", "#7c3aed"],
  ["academics", "Prepare academics", "Coordinate transcripts, context, and recommendations.", "#be123c"],
  ["testing", "Plan testing", "Choose useful tests and verify changing policies.", "#b45309"],
  ["profile", "Shape your profile", "Describe sustained contribution with clarity.", "#047857"],
  ["essays", "Write your story", "Draft and revise essays that sound like you.", "#9333ea"],
  ["applications", "Submit carefully", "Control every platform, form, and confirmation.", "#1d4ed8"],
  ["aid", "Handle financial aid", "Prepare documents and compare real affordability.", "#c2410c"],
  ["decisions", "Compare decisions", "Respond to outcomes with a calm, sustainable plan.", "#0f766e"],
  ["visa", "Complete visa steps", "Move from enrollment to a prepared interview.", "#334155"],
  ["arrival", "Arrive ready", "Prepare travel and your first practical week.", "#166534"]
].map(([id, title, summary, accent], index) => ({
  id,
  number: index + 1,
  title,
  summary,
  accent,
  taskIds: roadmapTasks.filter((task) => task.stageId === id).map((task) => task.id)
}));

const curatedColleges: College[] = [
  {
    slug: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    location: "Cambridge, Massachusetts",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Early Action", "Regular Action"],
    feeWaiver: "Review official application instructions.",
    themes: ["Engineering", "Computer science", "Research", "Making"],
    budgetFit: "full-need",
    summary: "A need-blind, full-need institution for domestic and international undergraduate students.",
    source: source("MIT Student Financial Services: Making MIT affordable", "https://sfs.mit.edu/undergraduate-students/the-cost-of-attendance/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "harvard",
    name: "Harvard College",
    shortName: "Harvard",
    location: "Cambridge, Massachusetts",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Restrictive Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Liberal arts", "Research", "Public service"],
    budgetFit: "full-need",
    summary: "Harvard states that its admissions and aid processes are the same regardless of nationality or citizenship.",
    source: source("Harvard College: International applicants", "https://college.harvard.edu/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "yale",
    name: "Yale College",
    shortName: "Yale",
    location: "New Haven, Connecticut",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "SAT or ACT required for first-year applicants; verify the current cycle.",
    englishTests: ["TOEFL", "IELTS", "Cambridge English", "DET", "InitialView"],
    applicationPlans: ["Single-Choice Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Liberal arts", "Research", "Arts", "Community"],
    budgetFit: "full-need",
    summary: "Yale states that international applicants are considered need-blind and eligible for the same need-based aid as domestic applicants.",
    source: source("Yale Admissions: International students", "https://admissions.yale.edu/applying-yale-international-student"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "princeton",
    name: "Princeton University",
    shortName: "Princeton",
    location: "Princeton, New Jersey",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Single-Choice Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Undergraduate focus", "Research", "Liberal arts", "Engineering"],
    budgetFit: "full-need",
    summary: "Princeton applies the same need-blind, grant-based financial-aid policy to international students.",
    source: source("Princeton Admission: International students", "https://admission.princeton.edu/apply/international-students"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "dartmouth",
    name: "Dartmouth College",
    shortName: "Dartmouth",
    location: "Hanover, New Hampshire",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Early Decision", "Regular Decision"],
    feeWaiver: "Common App fee waiver available for unusual financial hardship.",
    themes: ["Liberal arts", "Community", "Outdoors", "Research"],
    budgetFit: "full-need",
    summary: "Dartmouth states that it is need-blind and meets full demonstrated need for admitted students regardless of citizenship.",
    source: source("Dartmouth Admissions: Affordability", "https://admissions.dartmouth.edu/affordability-dartmouth"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "amherst",
    name: "Amherst College",
    shortName: "Amherst",
    location: "Amherst, Massachusetts",
    type: "Liberal arts college",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Early Decision", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Open curriculum", "Liberal arts", "Writing", "Small classes"],
    budgetFit: "full-need",
    summary: "Amherst describes its evaluation as need-blind for domestic and international applicants and its aid as need-based.",
    source: source("Amherst Admission: International overview", "https://admission.amherst.edu/www/documents/International%20Amherst%202019.pdf"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "bowdoin",
    name: "Bowdoin College",
    shortName: "Bowdoin",
    location: "Brunswick, Maine",
    type: "Liberal arts college",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Early Decision", "Regular Decision"],
    feeWaiver: "Automatically waived for applicants requesting aid.",
    themes: ["Liberal arts", "Community", "Sciences", "Outdoors"],
    budgetFit: "full-need",
    summary: "Bowdoin is need-blind for international students and meets full calculated need, with CSS Profile or an ISFAA route where eligible.",
    source: source("Bowdoin Student Aid: International students", "https://www.bowdoin.edu/student-aid/apply-for-aid/international-students.html"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "brown",
    name: "Brown University",
    shortName: "Brown",
    location: "Providence, Rhode Island",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["TOEFL", "IELTS", "DET", "PTE", "Cambridge English"],
    applicationPlans: ["Early Decision", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Open curriculum", "Liberal arts", "Research", "Independent learning"],
    budgetFit: "full-need",
    summary: "Beginning with the Class of 2029, Brown practices need-blind admission for international first-year applicants and meets full demonstrated need.",
    source: source("Brown Admission: Financial aid for international applicants", "https://admission.brown.edu/international/financial-aid"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "notre-dame",
    name: "University of Notre Dame",
    shortName: "Notre Dame",
    location: "Notre Dame, Indiana",
    type: "University",
    aidPolicy: "Need-blind",
    meetsFullNeed: true,
    meritAid: true,
    testingPolicy: "Test-optional through at least the 2026-27 academic year; verify before applying.",
    englishTests: ["TOEFL", "IELTS", "DET", "PTE Academic"],
    applicationPlans: ["Restrictive Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Engineering", "Business", "Liberal arts", "Community"],
    budgetFit: "full-need",
    summary: "Notre Dame states that its evaluation is need-blind for international applicants and that international applicants requesting need-based aid submit the CSS Profile.",
    source: source("Notre Dame Admissions: International applicants", "https://admissions.nd.edu/apply/resources-for/international-applicants/application-information/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "stanford",
    name: "Stanford University",
    shortName: "Stanford",
    location: "Stanford, California",
    type: "University",
    aidPolicy: "Need-aware",
    meetsFullNeed: true,
    meritAid: false,
    testingPolicy: "ACT or SAT required for students applying for fall 2026 and future years.",
    englishTests: ["Not required"],
    applicationPlans: ["Restrictive Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Engineering", "Computer science", "Research", "Entrepreneurship"],
    budgetFit: "partial-need",
    summary: "Stanford meets full need for admitted international citizens who request aid, but that request is a factor in admission evaluation.",
    source: source("Stanford Admission: International applicants", "https://admission.stanford.edu/apply/international/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "rochester",
    name: "University of Rochester",
    shortName: "Rochester",
    location: "Rochester, New York",
    type: "University",
    aidPolicy: "Need-aware",
    meetsFullNeed: true,
    meritAid: true,
    testingPolicy: "Verify current first-year testing requirements before applying.",
    englishTests: ["Verify on official admissions site"],
    applicationPlans: ["Early Decision", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Research", "Engineering", "Music", "Open curriculum"],
    budgetFit: "partial-need",
    summary: "Rochester meets full demonstrated need for admitted students, while noting that financial need contributes to international admission decisions.",
    source: source("Rochester Admissions: International students", "https://admissions.rochester.edu/applying/international-students/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  },
  {
    slug: "usc",
    name: "University of Southern California",
    shortName: "USC",
    location: "Los Angeles, California",
    type: "University",
    aidPolicy: "Merit-focused",
    meetsFullNeed: false,
    meritAid: true,
    testingPolicy: "Test-optional for the 2026-27 academic year; verify before applying.",
    englishTests: ["Verify approved exam routes on official page"],
    applicationPlans: ["Early Action", "Regular Decision"],
    feeWaiver: "Review official application instructions.",
    themes: ["Engineering", "Arts", "Business", "Los Angeles"],
    budgetFit: "merit",
    summary: "USC does not offer need-based aid to international applicants; eligible international applicants may compete for merit scholarships.",
    source: source("USC Admission: International students", "https://admission.usc.edu/prospective-students/how-to-apply/international-students/"),
    lastVerifiedAt: verifiedOn,
    reviewStatus: "published"
  }
];

const curatedByName = new Map(curatedColleges.map((college) => [college.name, college]));
export const colleges: College[] = (generatedCollegeCatalog.colleges as College[]).map((college) => ({
  ...college,
  ...curatedByName.get(college.name)
}));

export const faqs = [
  {
    question: "Is BD2US an admissions predictor?",
    answer:
      "No. The platform helps you plan, research, and verify your options. It does not claim to calculate admission odds or label selective colleges as safeties.",
    category: "Using BD2US"
  },
  {
    question: "Is the budget estimator my expected family contribution?",
    answer:
      "No. It is a planning tool for discussing a broad budget range. Every institution uses its own methodology and your actual offer can only come from that institution.",
    category: "Financial aid"
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The public guide, roadmap, search, and college explorer work without one. An optional account syncs progress, saves colleges, and stores your private notes across devices.",
    category: "Using BD2US"
  },
  {
    question: "How fresh is the college information?",
    answer:
      "Every college record shows the launch dataset review date and its source scope. Official links are added to cycle-sensitive facts as editors verify them; unavailable values stay unavailable rather than being guessed.",
    category: "Trust"
  },
  {
    question: "Can I use AI to write my essays?",
    answer:
      "Use AI cautiously for questions, brainstorming prompts, or feedback. Do not let a tool fabricate your experiences or replace your voice. Follow each college's application-integrity guidance.",
    category: "Applications"
  }
];

export const resources: OfficialResource[] = [
  { title: "EducationUSA Bangladesh", summary: "Official advising center, events, and local support for students in Bangladesh.", url: "https://educationusa.state.gov/centers/educationusa-bangladesh", category: "Start in Bangladesh", stage: "Orientation" },
  { title: "EducationUSA: Five Steps to U.S. Study", summary: "The official international-student sequence from research through departure.", url: "https://educationusa.state.gov/your-5-steps-us-study", category: "Start in Bangladesh", stage: "Orientation" },
  { title: "EducationUSA: Complete Your Application", summary: "Official overview of undergraduate application preparation for international students.", url: "https://educationusa.state.gov/your-5-steps-us-study/complete-your-application", category: "Start in Bangladesh", stage: "Applications" },

  { title: "EducationUSA: Research Your Options", summary: "A primary-source starting point for institution types, fit, and U.S. study choices.", url: "https://educationusa.state.gov/your-5-steps-us-study/research-your-options", category: "College research", stage: "College research" },
  { title: "College Navigator", summary: "U.S. Department of Education data for programs, enrollment, costs, and institutional characteristics.", url: "https://nces.ed.gov/collegenavigator/", category: "College research", stage: "College research" },
  { title: "Common Data Set initiative", summary: "Definitions and reporting standards behind many college Common Data Set files; search each college site for its current PDF.", url: "https://commondataset.org/", category: "College research", stage: "Data verification", caution: "The initiative defines the standard but does not host every college's completed file. Verify the institution, year, and section label on the college PDF." },
  { title: "IPEDS Data Center", summary: "U.S. Department of Education institutional data for enrollment, completions, costs, and other reported characteristics.", url: "https://nces.ed.gov/ipeds/use-the-data", category: "College research", stage: "Data verification" },
  { title: "SEVP School Search", summary: "Check whether a school is certified to enroll F or M international students.", url: "https://studyinthestates.dhs.gov/school-search", category: "College research", stage: "College research", caution: "SEVP certification does not indicate admission quality or financial-aid generosity." },

  { title: "Common App: First-year guide", summary: "Step-by-step guidance for creating, completing, and submitting a first-year application.", url: "https://www.commonapp.org/apply/first-year-students/", category: "Applications", stage: "Application platforms" },
  { title: "Common App: First-year toolkit", summary: "Worksheets for requirements, activities, essays, fee waivers, and recommendation planning.", url: "https://www.commonapp.org/apply/fy-toolkit/", category: "Applications", stage: "Applications" },
  { title: "Common App: Recommender guide", summary: "Official instructions for counselors and teachers submitting school forms and recommendations.", url: "https://www.commonapp.org/counselors-and-recommenders/recommender-guide/", category: "Applications", stage: "Recommendations" },
  { title: "Common App Help", summary: "Official application-platform support for students and recommenders.", url: "https://www.commonapp.org/help/", category: "Applications", stage: "Submission" },

  { title: "SAT", summary: "College Board registration, test dates, preparation, and score information.", url: "https://satsuite.collegeboard.org/sat", category: "Testing", stage: "Testing" },
  { title: "Bluebook", summary: "The official application used for the digital SAT and official practice tests.", url: "https://bluebook.collegeboard.org/", category: "Testing", stage: "Testing" },
  { title: "ACT", summary: "Official ACT registration, dates, preparation, and score information.", url: "https://www.act.org/content/act/en/products-and-services/the-act.html", category: "Testing", stage: "Testing" },
  { title: "College Board score sending", summary: "Official instructions for choosing recipients, sending SAT scores, and understanding delivery timing.", url: "https://satsuite.collegeboard.org/sat/scores/send-scores-to-colleges/sending-scores", category: "Testing", stage: "SAT policy verification" },
  { title: "ACT score reports", summary: "Official ACT guidance for sending scores and managing score recipients.", url: "https://www.act.org/content/act/en/products-and-services/the-act/scores/sending-your-scores.html", category: "Testing", stage: "ACT policy verification" },
  { title: "TOEFL iBT", summary: "ETS information about registration, test formats, scores, and sending results.", url: "https://www.ets.org/toefl/test-takers/ibt/about.html", category: "Testing", stage: "English proficiency" },
  { title: "IELTS", summary: "Official IELTS test information and booking routes.", url: "https://ielts.org/take-a-test", category: "Testing", stage: "English proficiency" },
  { title: "Duolingo English Test", summary: "Official DET format, readiness, registration, and score information.", url: "https://englishtest.duolingo.com/", category: "Testing", stage: "English proficiency" },
  { title: "PTE Academic", summary: "Pearson's official information about PTE Academic format, scores, booking, and score delivery.", url: "https://www.pearsonpte.com/pte-academic", category: "Testing", stage: "English proficiency" },
  { title: "Cambridge English recognition", summary: "Official Cambridge tool for checking which institutions recognize Cambridge English qualifications.", url: "https://www.cambridgeenglish.org/why-choose-us/global-recognition/", category: "Testing", stage: "English proficiency" },

  { title: "CSS Profile", summary: "College Board financial-aid application used by participating institutions.", url: "https://cssprofile.collegeboard.org/", category: "Financial aid", stage: "Financial aid" },
  { title: "CSS Profile participating institutions", summary: "Check which institutions use CSS Profile and whether international applicants submit it.", url: "https://profile.collegeboard.org/profile/ppi/participatingInstitutions.aspx", category: "Financial aid", stage: "Financial aid" },
  { title: "EducationUSA: Finance Your Studies", summary: "International-student planning guidance for costs, funding, and financial-aid research.", url: "https://educationusa.state.gov/your-5-steps-us-study/finance-your-studies", category: "Financial aid", stage: "Financial aid" },
  { title: "College Board scholarship search", summary: "A scholarship discovery tool from College Board; confirm every award on the sponsoring organization's own page.", url: "https://bigfuture.collegeboard.org/scholarship-search", category: "Financial aid", stage: "Scholarship research", caution: "A listing is a lead, not confirmation of international eligibility, renewal, or availability." },
  { title: "Federal Student Aid eligibility", summary: "Official federal-aid eligibility rules, useful for understanding why most international students rely on institutional or private funding.", url: "https://studentaid.gov/understand-aid/eligibility/requirements/non-us-citizens", category: "Financial aid", stage: "Eligibility", caution: "Do not complete U.S. federal-aid forms unless your citizenship or immigration category is eligible and the college instructs you to do so." },
  { title: "Federal Student Aid dictionary", summary: "Plain definitions for U.S. financial-aid terms that may appear in offers and conversations.", url: "https://studentaid.gov/articles/financial-aid-dictionary/", category: "Financial aid", stage: "Financial aid", caution: "Most U.S. federal student aid is not available to international applicants; use this primarily for terminology." },

  { title: "U.S. Department of State: Student Visa", summary: "Official overview of F-1 visa eligibility, application steps, and documentation.", url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html", category: "Visa and arrival", stage: "Visa" },
  { title: "U.S. Embassy in Bangladesh: Visas", summary: "Country-specific U.S. visa information and official links for applicants in Bangladesh.", url: "https://bd.usembassy.gov/visas/", category: "Visa and arrival", stage: "Bangladesh support" },
  { title: "Visa appointment wait times", summary: "Department of State estimates for interview appointment availability by post.", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wait-times.html", category: "Visa and arrival", stage: "Visa planning", caution: "Wait-time estimates change and are not appointment guarantees." },
  { title: "DS-160", summary: "Official online nonimmigrant visa application portal.", url: "https://ceac.state.gov/GenNIV/Default.aspx", category: "Visa and arrival", stage: "Visa", caution: "Use only the official .gov portal and keep the confirmation page." },
  { title: "SEVIS I-901 Fee", summary: "Official SEVIS fee information and payment route.", url: "https://www.fmjfee.com/i901fee/index.html", category: "Visa and arrival", stage: "Visa" },
  { title: "Study in the States: Student portal", summary: "Department of Homeland Security guidance for the F-1 student life cycle.", url: "https://studyinthestates.dhs.gov/students", category: "Visa and arrival", stage: "Visa and arrival" },
  { title: "Study in the States: Working", summary: "Official overview of employment rules and the role of your designated school official.", url: "https://studyinthestates.dhs.gov/students/resources/working", category: "Visa and arrival", stage: "Arrival", caution: "Ask your DSO before accepting work; authorization rules depend on status and circumstances." },
  { title: "EducationUSA: Prepare for Departure", summary: "Official pre-departure guidance for travel, orientation, and starting life in the United States.", url: "https://educationusa.state.gov/your-5-steps-us-study/prepare-your-departure", category: "Visa and arrival", stage: "Arrival" }
];

export const defaultProfile: StudentProfile = {
  curriculum: "SSC / HSC",
  currentYear: "Class 11",
  targetIntake: "Fall 2027",
  aidBand: "Need substantial aid",
  testingStatus: "Planning tests",
  interests: []
};

export const searchIndex: SearchResult[] = [
  {
    type: "Resource" as const,
    title: "Success stories",
    summary: "A growing space for consented, verified student journeys. Start with an invitation to imagine your own path.",
    href: "/success-stories",
    keywords: ["inspiration", "student journey", "you could be here"]
  },
  ...guides.map((guide) => ({
    type: "Guide" as const,
    title: guide.title,
    summary: guide.summary,
    href: `/guide/${guide.slug}`,
    keywords: [guide.slug, guide.eyebrow, ...guide.takeaways]
  })),
  ...blogs.map((blog) => ({
    type: "Blog" as const,
    title: blog.title,
    summary: blog.summary,
    href: `/blog/${blog.slug}`,
    keywords: [blog.category, blog.author, ...blog.blocks.flatMap((block) => block.type === "checklist" ? block.items : "text" in block ? [block.text] : [])]
  })),
  ...roadmapTasks.map((task) => ({
    type: "Task" as const,
    title: task.title,
    summary: task.description,
    href: `/roadmap#${task.id}`,
    keywords: [task.stageId, task.dueHint]
  })),
  ...colleges.map((college) => ({
    type: "College" as const,
    title: college.name,
    summary: college.summary,
    href: `/colleges/${college.slug}`,
    keywords: [
      college.shortName,
      ...(college.aliases ?? []),
      college.location,
      college.city ?? "",
      college.state ?? "",
      college.region ?? "",
      college.setting ?? "",
      college.enrollmentBand ?? "",
      college.control ?? "",
      college.aidPolicy,
      college.type,
      college.specialNote ?? "",
      college.costOfAttendance?.toString() ?? "",
      college.acceptanceRate?.toString() ?? "",
      college.internationalAidPercent?.toString() ?? "",
      college.averageInternationalAid?.toString() ?? "",
      college.testing?.policy.value ?? "",
      college.testing?.satComposite?.value?.toString() ?? "",
      ...(college.scholarships ?? []).flatMap((scholarship) => [scholarship.name, scholarship.amount ?? "", scholarship.notes ?? ""]),
      ...(college.researchHighlights ?? []),
      ...college.themes,
      ...college.englishTests
    ]
  })),
  ...glossary.map((item) => ({
    type: "Glossary" as const,
    title: item.term,
    summary: `${item.definition} ${item.bangla}`,
    href: `/glossary#${item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    keywords: ["glossary", item.bangla, item.relatedGuideSlug ?? "admissions"]
  })),
  ...faqs.map((faq) => ({
    type: "FAQ" as const,
    title: faq.question,
    summary: faq.answer,
    href: "/faq",
    keywords: [faq.category]
  })),
  ...resources.map(({ title, summary, url, category, stage }) => ({
    type: "Resource" as const,
    title,
    summary,
    href: url,
    keywords: [title, summary, category, stage]
  }))
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getCollege(slug: string) {
  return colleges.find((college) => college.slug === slug);
}
