import { NextResponse } from "next/server";
import { updateCareerProfile } from "../../../../server/services/career-assets";

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

function parseOptionalNumber(value: unknown) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    headline?: string;
    bio?: string;
    yearsExperience?: number | string;
    targetRoles?: string[] | string;
  };

  return NextResponse.json(
    await updateCareerProfile({
      headline: normalizeOptionalText(body.headline),
      bio: normalizeOptionalText(body.bio),
      yearsExperience: parseOptionalNumber(body.yearsExperience),
      targetRoles: Array.isArray(body.targetRoles) ? body.targetRoles : parseCsv(body.targetRoles)
    })
  );
}
