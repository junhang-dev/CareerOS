import { NextResponse } from "next/server";
import { createCareerProject } from "../../../../server/services/career-assets";

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

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    role?: string;
    description?: string;
    outcomes?: string[] | string;
    technologies?: string[] | string;
  };

  if (!body.name) {
    return NextResponse.json(
      {
        error: "name이 필요하다."
      },
      {
        status: 400
      }
    );
  }

  return NextResponse.json(
    await createCareerProject({
      name: body.name.trim(),
      role: normalizeOptionalText(body.role),
      description: normalizeOptionalText(body.description),
      outcomes: Array.isArray(body.outcomes) ? body.outcomes : parseCsv(body.outcomes),
      technologies: Array.isArray(body.technologies)
        ? body.technologies
        : parseCsv(body.technologies)
    }),
    { status: 201 }
  );
}
