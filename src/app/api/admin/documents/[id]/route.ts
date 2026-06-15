import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE: Delete a document by ID
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const document = await db.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the file from the local filesystem if a path exists
    if (document.filePath) {
      try {
        await unlink(document.filePath);
      } catch (fileError: any) {
        // If the file was already deleted or moved on disk, log it but don't crash
        console.warn(`File deletion warning: ${fileError.message}`);
      }
    }

    // Delete document entry from database
    // Cascading relationships in the DB automatically purge associated DocumentChunks
    await db.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}