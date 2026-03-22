import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "../../../server/services/dashboard";

export function GET() {
  return NextResponse.json(getDashboardSnapshot());
}

