import { NextResponse } from "next/server";
import {
  createApplicationPreparation,
  listApplicationPreparations
} from "../../../server/services/applications";
import { getJobPostingDetail } from "../../../server/services/job-postings";

export async function GET() {
  return NextResponse.json({
    items: await listApplicationPreparations()
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

  const jobPosting = await getJobPostingDetail(body.jobPostingId);

  if (!jobPosting) {
    return NextResponse.json(
      {
        error: "job posting not found"
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json(
    await createApplicationPreparation({
      jobPostingId: body.jobPostingId,
      strategyNote: body.strategyNote
    }),
    { status: 201 }
  );
}
