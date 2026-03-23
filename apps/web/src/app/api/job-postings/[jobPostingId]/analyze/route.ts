import { NextResponse } from "next/server";
import { runJobPostingAnalysis } from "../../../../../server/services/job-postings";

type RouteContext = {
  params: Promise<{
    jobPostingId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  const params = await context.params;
  const detail = await runJobPostingAnalysis(params.jobPostingId);

  if (!detail) {
    return NextResponse.json({ error: "job posting not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
