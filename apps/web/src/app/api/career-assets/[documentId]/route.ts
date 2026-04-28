import { NextResponse } from "next/server";
import {
  deleteCareerDocument,
  updateCareerDocument
} from "../../../../server/services/career-assets";
import {
  createApiErrorBody,
  isInputValidationError,
  parseCareerDocumentUpdate,
  toApiErrorBody
} from "../../../../server/services/career-assets-inputs";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;

  try {
    const updated = await updateCareerDocument(
      parseCareerDocumentUpdate(params.documentId, await request.json())
    );

    if (!updated) {
      return NextResponse.json(
        createApiErrorBody("career document not found", "career_document_not_found"),
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
        createApiErrorBody("career document payload는 object여야 한다.", "invalid_payload"),
        { status: 400 }
      );
    }

    throw error;
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerDocument(params.documentId);

  if (!deleted) {
    return NextResponse.json(
      createApiErrorBody("career document not found", "career_document_not_found"),
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
