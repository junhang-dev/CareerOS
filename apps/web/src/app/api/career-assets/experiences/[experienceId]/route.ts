import { NextResponse } from "next/server";
import {
  deleteCareerExperience,
  updateCareerExperience
} from "../../../../../server/services/career-assets";

type RouteContext = {
  params: Promise<{
    experienceId: string;
  }>;
};

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

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
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
    const updated = await updateCareerExperience({
      id: params.experienceId,
      company: body.company.trim(),
      role: body.role.trim(),
      startDate: body.startDate.trim(),
      endDate: normalizeDateInput(body.endDate),
      description: normalizeOptionalText(body.description),
      achievements: Array.isArray(body.achievements) ? body.achievements : parseCsv(body.achievements)
    });

    if (!updated) {
      return NextResponse.json({ error: "career experience not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("endDate")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerExperience(params.experienceId);

  if (!deleted) {
    return NextResponse.json({ error: "career experience not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
