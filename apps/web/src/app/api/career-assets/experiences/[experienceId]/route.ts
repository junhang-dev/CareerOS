import { NextResponse } from "next/server";
import {
  deleteCareerExperience,
  updateCareerExperience
} from "../../../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerExperienceUpdate,
  toApiErrorBody
} from "../../../../../server/services/career-assets-inputs";

type RouteContext = {
  params: Promise<{
    experienceId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;

  try {
    const updated = await updateCareerExperience(
      parseCareerExperienceUpdate(params.experienceId, await request.json())
    );

    if (!updated) {
      return NextResponse.json(
        createApiErrorBody("career experience not found", "career_experience_not_found"),
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
        createApiErrorBody("career experience payload는 object여야 한다.", "invalid_payload"),
        { status: 400 }
      );
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerExperience(params.experienceId);

  if (!deleted) {
    return NextResponse.json(
      createApiErrorBody("career experience not found", "career_experience_not_found"),
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
