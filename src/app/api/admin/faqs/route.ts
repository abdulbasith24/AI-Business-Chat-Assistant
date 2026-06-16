import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Retrieve all FAQs
export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new FAQ
export async function POST(request: Request) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    const faq = await db.fAQ.create({
      data: { question, answer },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}