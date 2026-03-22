import { NextResponse } from "next/server";
import { listJobPostings } from "../../../server/services/job-postings";

export function GET() {
  return NextResponse.json({
    items: listJobPostings()
  });
}

