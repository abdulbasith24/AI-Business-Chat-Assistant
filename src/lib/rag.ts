import { readFile } from "fs/promises";
import { createRequire } from "module";
import { ai } from "./gemini";
import { db } from "./db"; 

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

// Define a strong TypeScript interface for search results
export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
}

interface DbChunkRow {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  similarity: number;
}

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

/**
 * 4. Execute a pgvector Cosine Similarity query against PostgreSQL
 */
export async function searchSimilarity(
  queryText: string,
  limit = 4,
  minSimilarity = 0.50
): Promise<SearchResult[]> {
  try {
    // A. Generate an embedding representing the user's search query
    const queryEmbedding = await generateEmbedding(queryText);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    // B. Execute parameterized pgvector raw query inside Prisma
    const results = await db.$queryRawUnsafe<DbChunkRow[]>(
      `SELECT 
         c.id, 
         c.document_id, 
         d.title AS document_title, 
         c.content,
         (1 - (c.embedding <=> $1::vector))::float AS similarity
       FROM document_chunks c
       JOIN documents d ON c.document_id = d.id
       WHERE (1 - (c.embedding <=> $1::vector)) >= $2
       ORDER BY c.embedding <=> $1::vector
       LIMIT $3`,
      vectorString,
      minSimilarity,
      limit
    );

    // C. Map database fields cleanly to our TypeScript interface
    return results.map((row) => ({
      id: row.id,
      documentId: row.document_id,
      documentTitle: row.document_title,
      content: row.content,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error("Vector Search Query Error:", error);
    throw error;
  }
}