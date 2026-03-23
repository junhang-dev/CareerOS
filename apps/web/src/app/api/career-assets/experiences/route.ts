import { NextResponse } from "next/server";
import { createCareerExperience } from "../../../../server/services/career-assets";

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function parseCsv(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDateInput(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    achievements?: string[] | string;
  };

  if (!body.company || !body.role || !body.startDate) {
    return NextResponse.json(
      {
        error: "company, role, startDate가 필요하다."
      },
      {
        status: 400
      }
    );
  }

  try {
    return NextResponse.json(
      await createCareerExperience({
        company: body.company.trim(),
        role: body.role.trim(),
        startDate: body.startDate.trim(),
        endDate: normalizeDateInput(body.endDate),
        description: normalizeOptionalText(body.description),
        achievements: Array.isArray(body.achievements) ? body.achievements : parseCsv(body.achievements)
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("endDate")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
