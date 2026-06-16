import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE: Remove an FAQ
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}