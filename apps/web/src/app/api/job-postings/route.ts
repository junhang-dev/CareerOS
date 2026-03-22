import { NextResponse } from "next/server";
import { listJobPostings } from "../../../server/services/job-postings";

export async function GET() {
  return NextResponse.json({
    items: await listJobPostings()
  });
}
