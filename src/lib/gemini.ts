import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

// Instantiate the type-safe modern Google GenAI Client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});