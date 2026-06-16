import { db } from "./db";

/**
 * Normalizes strings by removing casing, spaces, and punctuation.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // Keep only letters and numbers
    .trim();
}

/**
 * Checks if the user's query matches an existing FAQ.
 * Returns the answer if matched, otherwise null.
 */
export async function matchFAQ(userQuery: string): Promise<string | null> {
  try {
    const cleanQuery = normalizeText(userQuery);
    if (!cleanQuery) return null;

    // Fetch all active FAQs from database
    const faqs = await db.fAQ.findMany(); // Prisma maps model 'FAQ' to 'fAQ' or 'faq'

    for (const faq of faqs) {
      const cleanQuestion = normalizeText(faq.question);

      // Match condition: exact match, or if the user query contains the FAQ question, or vice-versa
      if (
        cleanQuery === cleanQuestion ||
        cleanQuery.includes(cleanQuestion) ||
        cleanQuestion.includes(cleanQuery)
      ) {
        return faq.answer;
      }
    }

    return null;
  } catch (error) {
    console.error("FAQ Matching Error:", error);
    return null; // Fail-silent: continue to standard RAG pipeline if DB search fails
  }
}