import { NextResponse } from "next/server";
import { createCareerExperience } from "../../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerExperienceCreate,
  toApiErrorBody
} from "../../../../server/services/career-assets-inputs";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createCareerExperience(parseCareerExperienceCreate(await request.json())), {
      status: 201
    });
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
