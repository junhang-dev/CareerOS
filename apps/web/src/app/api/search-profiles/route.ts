import { NextResponse } from "next/server";
import { createSearchProfile, listSearchProfiles } from "../../../server/services/search-profiles";

export function GET() {
  return NextResponse.json({
    items: listSearchProfiles()
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    scheduleRule?: string;
    priority?: number;
    filters?: Record<string, unknown>;
  };

  if (!body.name || !body.scheduleRule) {
    return NextResponse.json(
      {
        error: "name과 scheduleRule이 필요하다."
      },
      {
        status: 400
      }
    );
  }

  return NextResponse.json(createSearchProfile(body), { status: 201 });
}

