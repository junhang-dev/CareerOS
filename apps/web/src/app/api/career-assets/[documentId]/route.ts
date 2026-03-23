import { NextResponse } from "next/server";
import {
  deleteCareerDocument,
  updateCareerDocument
} from "../../../../server/services/career-assets";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function parseStructuredJson(value: unknown) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return {};
  }

  const parsed = JSON.parse(normalized);
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
}

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = (await request.json()) as {
    docType?: "resume" | "cover_letter" | "portfolio" | "note";
    title?: string;
    sourceType?: "manual" | "upload" | "notion" | "linkedin" | "github";
    storagePath?: string;
    parsedText?: string;
    structuredJson?: string;
    structured?: Record<string, unknown>;
    version?: number;
  };

  if (!body.docType || !body.title || !body.sourceType) {
    return NextResponse.json(
      {
        error: "docType, title, sourceType이 필요하다."
      },
      {
        status: 400
      }
    );
  }

  let structured: Record<string, unknown>;

  try {
    structured = body.structured ?? parseStructuredJson(body.structuredJson);
  } catch {
    return NextResponse.json(
      {
        error: "structuredJson은 JSON object여야 한다."
      },
      {
        status: 400
      }
    );
  }

  const updated = await updateCareerDocument({
    id: params.documentId,
    docType: body.docType,
    title: body.title.trim(),
    sourceType: body.sourceType,
    storagePath: normalizeOptionalText(body.storagePath),
    parsedText: normalizeOptionalText(body.parsedText),
    structured,
    version: body.version
  });

  if (!updated) {
    return NextResponse.json({ error: "career document not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteCareerDocument(params.documentId);

  if (!deleted) {
    return NextResponse.json({ error: "career document not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
