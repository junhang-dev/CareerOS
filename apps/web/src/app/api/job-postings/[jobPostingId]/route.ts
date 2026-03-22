import { NextResponse } from "next/server";
import { getJobPostingDetail } from "../../../../server/services/job-postings";

type RouteContext = {
  params: Promise<{
    jobPostingId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const params = await context.params;
  const detail = getJobPostingDetail(params.jobPostingId);

  if (!detail) {
    return NextResponse.json(
      {
        error: "job posting not found"
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json(detail);
}

