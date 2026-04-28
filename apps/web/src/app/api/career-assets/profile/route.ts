import { NextResponse } from "next/server";
import { updateCareerProfile } from "../../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerProfilePatch,
  toApiErrorBody
} from "../../../../server/services/career-assets-inputs";

export async function PUT(request: Request) {
  try {
    return NextResponse.json(await updateCareerProfile(parseCareerProfilePatch(await request.json())));
  } catch (error) {
    if (isInputValidationError(error)) {
      return NextResponse.json(toApiErrorBody(error), { status: error.status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createApiErrorBody("profile payload는 object여야 한다.", "invalid_payload"),
        { status: 400 }
      );
    }

    throw error;
  }
}
