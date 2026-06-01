import type { ContentBlock, Source } from "@/lib/types";

const verifiedOn = "2026-06-01";
const source = (label: string, url: string): Source => ({ label, url, lastVerifiedAt: verifiedOn });

// Legacy chapters supply the original BD2US writing for the first nine guide routes.
// These entries extend the roadmap through the post-admission journey.
export const guideContent: Record<string, ContentBlock[]> = {
  decisions: [
    { type: "paragraph", text: "When decisions arrive, slow down. An admission letter is exciting, but the right next step is to understand the offer, compare the four-year reality, and respond by the stated deadline." },
    { type: "heading", text: "Read the financial-aid offer as carefully as the admission letter" },
    { type: "paragraph", text: "Identify grants, scholarships, loans, work expectations, billed costs, estimated non-billed costs, and renewal conditions. Ask the financial-aid office when anything is unclear." },
    { type: "heading", text: "Handle each outcome intentionally" },
    { type: "checklist", title: "Decision responses", items: ["Admission: compare fit and affordability before depositing.", "Deferral: follow the college's instructions and provide only useful updates.", "Waitlist: decide whether you want to remain on it and understand the uncertainty.", "Denial: close the loop, protect your confidence, and keep moving through your options."] },
    { type: "callout", tone: "tip", title: "An appeal needs new information", text: "If financial circumstances were misunderstood or changed materially, contact the aid office with concise evidence and follow its review process." }
  ],
  visa: [
    { type: "paragraph", text: "After you enroll, follow your college's international-student office and official U.S. government instructions closely. Keep names, dates, funding details, and documents consistent across the process." },
    { type: "heading", text: "Move through the sequence carefully" },
    { type: "checklist", title: "Core visa workflow", items: ["Complete the college's enrollment and financial-document steps.", "Receive and review your Form I-20 from the school.", "Pay the SEVIS I-901 fee using the official route when instructed.", "Complete the DS-160 accurately.", "Follow the embassy or consulate instructions for scheduling and documents.", "Prepare to explain your study plan, funding, and intentions clearly and honestly."] },
    { type: "callout", tone: "warning", title: "Use official instructions", text: "Government procedures, fees, appointment availability, and document requirements can change. Use your college's international office and official U.S. government websites." }
  ],
  arrival: [
    { type: "paragraph", text: "Arrival is part of the plan, not an afterthought. A calmer first week begins before you fly: review your college instructions, keep essential documents accessible, and decide how you will handle the first practical tasks." },
    { type: "heading", text: "Keep essentials in your carry-on" },
    { type: "checklist", title: "Travel folder", items: ["Passport, visa, and Form I-20", "College address and international-office contact", "Housing and arrival instructions", "Emergency contacts", "A copy of key financial and health records", "Medication and a small first-day essentials kit"] },
    { type: "heading", text: "Plan your first week" },
    { type: "checklist", title: "First-week setup", items: ["Complete international-student check-in and orientation.", "Confirm housing and campus access.", "Set up connectivity.", "Understand banking options before opening an account.", "Learn the campus health and safety resources.", "Ask for help early when something is unclear."] }
  ]
};

export const guideSources: Partial<Record<string, Source[]>> = {
  "standardized-testing": [
    source("College Board: SAT", "https://satsuite.collegeboard.org/sat"),
    source("College Board: Bluebook", "https://bluebook.collegeboard.org/"),
    source("ACT: The ACT Test", "https://www.act.org/content/act/en/products-and-services/the-act.html")
  ],
  "application-platforms": [
    source("Common App: First-year application guide", "https://www.commonapp.org/apply/first-year-students")
  ],
  "financial-aid": [
    source("College Board: CSS Profile", "https://cssprofile.collegeboard.org/")
  ],
  visa: [
    source("U.S. Department of State: Student Visa", "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html"),
    source("ICE: I-901 SEVIS Fee", "https://www.ice.gov/sevis/i901")
  ]
};
