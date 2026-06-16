import { NextResponse } from "next/server";
import { searchSimilarity } from "@/lib/rag";
import { db } from "@/lib/db";
import { ai } from "@/lib/gemini";

// Force edge or serverless runtime to support streaming connections
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Get the latest user query from the message thread
    const latestMessage = messages[messages.length - 1];
    const userQuery = latestMessage.content;

    // 1. Fetch General Company Information
    const company = await db.company.findFirst();
    const companyContext = company
      ? `Company Name: ${company.name}
         About: ${company.description}
         Services: ${company.services}
         Contact: ${company.contactInfo}
         Address: ${company.address}
         Hours: ${company.businessHours}`
      : "No general company information configured yet.";

    // 2. Query matching chunks (using 45% similarity gate threshold)
    const matchedChunks = await searchSimilarity(userQuery, 4, 0.45);
    const retrievedText = matchedChunks
      .map((c, idx) => `[Doc ${idx + 1}] Source: "${c.documentTitle}"\n${c.content}`)
      .join("\n\n");

    // 3. Assemble Grounding Rules Prompt
    const systemInstruction = `
      You are an elite, helpful AI business assistant representing this company.
      Provide accurate, grounded answers based ONLY on the Company Information and Retrieved Context.

      CONSTRAINTS:
      1. Grounding: Answer ONLY using facts from the provided context. Do not invent details.
      2. Missing Info / Out-of-scope: If the context does not answer the question, or if the question is unrelated to the company, reply with exactly:
         "Sorry, I can only answer questions related to this company and its services."
      3. Tone: Professional, direct, and concise. Format with clear spacing or bullet points if necessary.

      ---
      START OF CONTEXT:
      [Company Information]
      ${companyContext}

      [Retrieved Context Chunks]
      ${retrievedText}
      END OF CONTEXT
      ---
    `;

    // 4. Call Gemini's live stream engine
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: userQuery,
      config: {
        systemInstruction,
        temperature: 0.1, // Keep answers deterministic and factual
      },
    });

    // 5. Construct a Web ReadableStream to pipe chunks directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    // Return standard stream response mapping text/event-stream parameters
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Public Chat Stream Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}