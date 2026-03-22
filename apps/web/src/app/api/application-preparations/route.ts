import { NextResponse } from "next/server";
import {
  createApplicationPreparation,
  listApplicationPreparations
} from "../../../server/services/applications";

export function GET() {
  return NextResponse.json({
    items: listApplicationPreparations()
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    jobPostingId?: string;
    strategyNote?: string;
  };

  if (!body.jobPostingId) {
    return NextResponse.json(
      {
        error: "jobPostingId가 필요하다."
      },
      {
        status: 400
      }
    );
  }

  return NextResponse.json(createApplicationPreparation(body), { status: 201 });
}

