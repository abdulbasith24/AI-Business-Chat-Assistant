import { NextResponse } from "next/server";
import { generateGroundedAnswer } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Call our RAG grounded generator
    const ragResult = await generateGroundedAnswer(query);

    return NextResponse.json({
      answer: ragResult.answer,
      chunks: ragResult.sources, // This now contains full id, title, content, and similarity
    });
  } catch (error) {
    console.error("Failed to run test vector search:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}