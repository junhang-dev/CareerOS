import { NextResponse } from "next/server";
import {
  deleteCareerProject,
  updateCareerProject
} from "../../../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerProjectUpdate,
  toApiErrorBody
} from "../../../../../server/services/career-assets-inputs";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;

  try {
    const updated = await updateCareerProject(
      parseCareerProjectUpdate(params.projectId, await request.json())
    );

    if (!updated) {
      return NextResponse.json(
        createApiErrorBody("career project not found", "career_project_not_found"),
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (isInputValidationError(error)) {
      return NextResponse.json(toApiErrorBody(error), { status: error.status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createApiErrorBody("career project payload는 object여야 한다.", "invalid_payload"),
        { status: 400 }
      );
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerProject(params.projectId);

  if (!deleted) {
    return NextResponse.json(
      createApiErrorBody("career project not found", "career_project_not_found"),
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
