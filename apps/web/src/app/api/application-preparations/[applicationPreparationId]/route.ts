import { NextResponse } from "next/server";
import {
  deleteApplicationPreparation,
  updateApplicationPreparation
} from "../../../../server/services/applications";

type RouteContext = {
  params: Promise<{
    applicationPreparationId: string;
  }>;
};

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizeOptionalId(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = (await request.json()) as {
    status?: "drafting" | "ready_for_review" | "approved" | "rejected" | "archived";
    strategyNote?: string;
    approvalRequired?: boolean;
    targetResumeId?: string | null;
    targetCoverLetterId?: string | null;
  };

  if (!body.status || typeof body.approvalRequired !== "boolean") {
    return NextResponse.json(
      {
        error: "status와 approvalRequired가 필요하다."
      },
      {
        status: 400
      }
    );
  }

  const updated = await updateApplicationPreparation({
    id: params.applicationPreparationId,
    status: body.status,
    strategyNote: normalizeOptionalText(body.strategyNote),
    approvalRequired: body.approvalRequired,
    targetResumeId: normalizeOptionalId(body.targetResumeId),
    targetCoverLetterId: normalizeOptionalId(body.targetCoverLetterId)
  });

  if (!updated) {
    return NextResponse.json({ error: "application preparation not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const deleted = await deleteApplicationPreparation(params.applicationPreparationId);

  if (!deleted) {
    return NextResponse.json({ error: "application preparation not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
