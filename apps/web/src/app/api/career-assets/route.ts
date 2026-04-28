import { NextResponse } from "next/server";
import {
  createCareerDocument,
  getCareerAssetSnapshot
} from "../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerDocumentCreate,
  toApiErrorBody
} from "../../../server/services/career-assets-inputs";

export async function GET() {
  return NextResponse.json(await getCareerAssetSnapshot());
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createCareerDocument(parseCareerDocumentCreate(await request.json())), {
      status: 201
    });
  } catch (error) {
    if (isInputValidationError(error)) {
      return NextResponse.json(toApiErrorBody(error), { status: error.status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createApiErrorBody("career document payload는 object여야 한다.", "invalid_payload"),
        { status: 400 }
      );
    }

    throw error;
  }
}
