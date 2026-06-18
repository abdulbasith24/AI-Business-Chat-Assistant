import { GoogleGenAI } from "@google/genai";
import { searchSimilarity } from "./rag";
import { db } from "./db";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

// Instantiate the type-safe modern Google GenAI Client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates an answer grounded strictly in company knowledge base.
 * Handles out-of-scope questions gracefully.
 */
export async function generateGroundedAnswer(userQuery: string): Promise<{
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    similarity: number;
  }>;
}> {
  try {
    // 1. Fetch Company Information (to supplement document chunks)
    const company = await db.company.findFirst();
    const companyContext = company
      ? `Company Name: ${company.name}
         About: ${company.description}
         Services: ${company.services}
         Contact: ${company.contactInfo}
         Address: ${company.address}
         Hours: ${company.businessHours}`
      : "No general company information configured yet.";

    // 2. Retrieve top matching knowledge chunks (using Phase 5 search)
    const matchedChunks = await searchSimilarity(userQuery, 4, 0.45); // Using 45% threshold for slight flexibility

    // 3. Construct the prompt context
    const retrievedText = matchedChunks
      .map((c, idx) => `[Doc ${idx + 1}] Source File: "${c.documentTitle}"\nContent: ${c.content}`)
      .join("\n\n");

    // 4. Formulate the strict RAG System Instructions
    const systemInstruction = `
      You are an elite, professional AI business assistant representing this company.
      Your primary goal is to provide accurate, grounded answers to visitor questions based ONLY on the provided Company Information and Retrieved Context below.

      CRITICAL CONSTRAINTS:
      1. Grounding Rule: Answer the question using ONLY facts found inside the context. Do not invent, assume, or extrapolate any details.
      2. Missing Info: If the provided context does not contain the answer to the question, or if the question is unrelated to the company, its services, or its team, you MUST refuse the question and reply with exactly:
         "Sorry, I can only answer questions related to this company and its services."
      3. Out-of-Scope: Under no circumstances should you answer unrelated general knowledge questions. For example, if asked about sports, historical events, programming questions unrelated to the company's stack, or general trivia, you must trigger the refusal sentence in Constraint 2.
      4. Tone: Keep your tone professional, friendly, helpful, and concise. Use clear formatting or bullet points if appropriate.

      ---
      START OF CONTEXT:
      
      [Company Information]
      ${companyContext}

      [Retrieved Context Chunks]
      ${retrievedText}
      
      END OF CONTEXT
      ---
    `;

    // 5. Query Gemini's text generation model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Fast, accurate, and optimized for reasoning and text generation
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction, // Mounts our system prompt as the core runtime constraint
        temperature: 0.1, // Forces highly deterministic, factual responses (minimizes creativity/hallucinations)
      }
    });

    const aiAnswer = response.text || "Sorry, I am unable to generate a response at this moment.";

    return {
      answer: aiAnswer,
      sources: matchedChunks.map((c) => ({
        id: c.id,
        title: c.documentTitle,
        content: c.content,
        similarity: c.similarity,
      })),
    };
  } catch (error) {
    console.error("Grounded Generation Error:", error);
    throw error;
  }
}