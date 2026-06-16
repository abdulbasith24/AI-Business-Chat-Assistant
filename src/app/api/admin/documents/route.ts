import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { parseDocument, chunkText, generateEmbedding } from "@/lib/rag";
import crypto from "crypto";

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

// POST: Upload, Parse, Chunk, Embed, and save a document
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

    // 1. Save file to the local disk
    await writeFile(filePath, buffer);

    // 2. Parse text contents from file
    const rawText = await parseDocument(filePath, fileType);

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "The uploaded file is empty or has no readable text." },
        { status: 400 }
      );
    }

    // 3. Log main Document metadata into the database
    const document = await db.document.create({
      data: {
        title: file.name,
        filePath: filePath,
        fileType,
      },
    });

    // 4. Split parsed text into clean chunks
    const chunks = chunkText(rawText);

    // 5. Generate embeddings and save chunks via raw SQL (Prisma pgvector write)
    for (const chunkContent of chunks) {
      const embedding = await generateEmbedding(chunkContent);
      const chunkId = crypto.randomUUID();

      // Stringify the array of floats to a Postgres-compliant vector array format
      const vectorString = `[${embedding.join(",")}]`;

      // Safe parameter-bound raw SQL execution targeting pgvector
      await db.$executeRawUnsafe(
        `INSERT INTO document_chunks (id, document_id, content, embedding) VALUES ($1, $2, $3, $4::vector)`,
        chunkId,
        document.id,
        chunkContent,
        vectorString
      );
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      fileType: document.fileType,
      chunksProcessed: chunks.length,
    });
  } catch (error) {
    console.error("Failed to upload and process document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
