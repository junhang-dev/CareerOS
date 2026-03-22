import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "../../../server/services/dashboard";

export async function GET() {
  return NextResponse.json(await getDashboardSnapshot());
}
