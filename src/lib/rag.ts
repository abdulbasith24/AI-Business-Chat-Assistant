import { readFile } from "fs/promises";
import { createRequire } from "module";
import { ai } from "./gemini";


const require = createRequire(import.meta.url);

const pdf = require("pdf-parse") as (
  dataBuffer: Buffer,
  options?: Record<string, unknown>
) => Promise<{
  numpages: number;
  numrender: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: string;
  text: string;
}>;

/**
 * 1. Parse document contents based on file extensions
 */
export async function parseDocument(filePath: string, fileType: string): Promise<string> {
  const fileBuffer = await readFile(filePath);

  if (fileType === "pdf") {
    // Parse PDF binary buffers into continuous plain text
    const parsedData = await pdf(fileBuffer);
    return parsedData.text;
  }

  // Handle plain text (.txt) and Markdown (.md) documents
  return fileBuffer.toString("utf-8");
}

/**
 * 2. Sliding window text chunking algorithm
 * Splits text into segments of size `chunkSize` with `overlap` to preserve contextual continuity.
 */
export function chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
  // Normalize whitespaces and trim
  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  let index = 0;
  while (index < cleanText.length) {
    const chunk = cleanText.substring(index, index + chunkSize);
    chunks.push(chunk);
    // Slide the window forward by chunk size minus overlap
    index += chunkSize - overlap;
  }

  return chunks;
}

/**
 * 3. Generate 768-dimensional text embeddings from Google Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001", //text-embedding-004
      contents: text,
      config: {
        outputDimensionality: 768, // Fits our PostgreSQL Unsupported("vector(768)") schema
      }
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("No embeddings returned from Gemini API");
    }

    const values = response.embeddings[0].values;

    // Type guard checking to guarantee values is not undefined
    if (!values) {
      throw new Error("Gemini returned empty embedding values");
    }

    return values;
  } catch (error) {
    console.error("Gemini Embedding API Error:", error);
    throw error;
  }
}