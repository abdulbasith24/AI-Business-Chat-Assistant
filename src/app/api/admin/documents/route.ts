import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET: Retrieve list of tracked documents
export async function GET() {
  try {
    const documents = await db.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Upload and save a document
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Determine and validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    let fileType = "";
    if (fileExtension === ".pdf") fileType = "pdf";
    else if (fileExtension === ".txt") fileType = "txt";
    else if (fileExtension === ".md") fileType = "md";
    else {
      return NextResponse.json(
        { error: "Unsupported file type. Only PDF, TXT, and MD are allowed." },
        { status: 400 }
      );
    }

    // Read the file data into a binary buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Secure local path storage directory
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Sanitize the filename to prevent path traversal attacks
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file to the local disk
    await writeFile(filePath, buffer);

    // Log metadata into the database
    const document = await db.document.create({
      data: {
        title: file.name,
        filePath: filePath,
        fileType,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to upload document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}