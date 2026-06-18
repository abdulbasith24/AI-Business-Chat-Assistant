import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Run parallel counts to optimize serverless execution
    const [company, totalDocs, totalChunks, totalFaqs] = await Promise.all([
      db.company.findFirst(),
      db.document.count(),
      db.documentChunk.count(),
      db.fAQ.count(),
    ]);

    return NextResponse.json({
      companyConfigured: !!company,
      companyName: company?.name || "Not Configured",
      documentsCount: totalDocs,
      chunksCount: totalChunks,
      faqsCount: totalFaqs,
      dbStatus: "Healthy",
    });
  } catch (error) {
    console.error("Failed to compile admin stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", dbStatus: "Disconnected" },
      { status: 500 }
    );
  }
}