import { NextResponse } from "next/server";
import { searchSimilarity } from "@/lib/rag";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Run the similarity search query
    const matchedChunks = await searchSimilarity(query);

    return NextResponse.json({ chunks: matchedChunks });
  } catch (error) {
    console.error("Failed to run test vector search:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}