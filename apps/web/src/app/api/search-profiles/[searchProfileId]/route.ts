import { NextResponse } from "next/server";
import {
  deleteSearchProfile,
  updateSearchProfile
} from "../../../../server/services/search-profiles";

type RouteContext = {
  params: Promise<{
    searchProfileId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = (await request.json()) as {
    name?: string;
    scheduleRule?: string;
    priority?: number;
    isActive?: boolean;
    filters?: Record<string, unknown>;
  };

  if (!body.name || !body.scheduleRule) {
    return NextResponse.json({ error: "name과 scheduleRule이 필요하다." }, { status: 400 });
  }

  const updated = await updateSearchProfile({
    id: params.searchProfileId,
    name: body.name,
    scheduleRule: body.scheduleRule,
    priority: body.priority,
    isActive: body.isActive ?? true,
    filters: body.filters
  });

  if (!updated) {
    return NextResponse.json({ error: "search profile not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  await deleteSearchProfile(params.searchProfileId);

  return new Response(null, { status: 204 });
}

