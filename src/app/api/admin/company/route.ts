import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CompanySchema } from "@/lib/validation";

// GET: Retrieve company information
export async function GET() {
  try {
    const company = await db.company.findFirst();
    
    // Return empty default state if database is uninitialized
    if (!company) {
      return NextResponse.json({
        name: "",
        description: "",
        services: "",
        contactInfo: "",
        address: "",
        businessHours: "",
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Failed to fetch company details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH: Update or insert company information
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation check
    const validation = CompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", issues: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const existingCompany = await db.company.findFirst();

    let company;
    if (existingCompany) {
      // Update existing record
      company = await db.company.update({
        where: { id: existingCompany.id },
        data,
      });
    } else {
      // Create first record
      company = await db.company.create({
        data,
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Failed to update company details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}