import { NextResponse } from "next/server";
import {
  deleteCareerProject,
  updateCareerProject
} from "../../../../../server/services/career-assets";

type RouteContext = {
  params: Promise<{
    projectId: string;
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

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = (await request.json()) as {
    name?: string;
    role?: string;
    description?: string;
    outcomes?: string[] | string;
    technologies?: string[] | string;
  };

  if (!body.name) {
    return NextResponse.json({ error: "name이 필요하다." }, { status: 400 });
  }

  const updated = await updateCareerProject({
    id: params.projectId,
    name: body.name.trim(),
    role: normalizeOptionalText(body.role),
    description: normalizeOptionalText(body.description),
    outcomes: Array.isArray(body.outcomes) ? body.outcomes : parseCsv(body.outcomes),
    technologies: Array.isArray(body.technologies) ? body.technologies : parseCsv(body.technologies)
  });

  if (!updated) {
    return NextResponse.json({ error: "career project not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerProject(params.projectId);

  if (!deleted) {
    return NextResponse.json({ error: "career project not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
