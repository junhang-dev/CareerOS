import { NextResponse } from "next/server";
import { getCareerAssetSnapshot } from "../../../server/services/career-assets";

export function GET() {
  return NextResponse.json(getCareerAssetSnapshot());
}

