import { NextResponse } from "next/server";
import { createJobPosting, listJobPostings } from "../../../server/services/job-postings";

function parseCsv(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizePostedAt(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? new Date(`${normalized}T00:00:00.000Z`).toISOString() : undefined;
}

export async function GET() {
  return NextResponse.json({
    items: await listJobPostings()
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    title?: string;
    url?: string;
    locationText?: string;
    employmentType?: string;
    status?: "active" | "closed" | "unknown";
    postedAt?: string;
    sourceJobId?: string;
    initialVersion?: {
      summary?: string;
      rawText?: string;
      qualifications?: string[] | string;
      preferredQualifications?: string[] | string;
      techStack?: string[] | string;
    };
  };

  if (!body.companyName || !body.title || !body.url) {
    return NextResponse.json(
      {
        error: "companyName, title, url이 필요하다."
      },
      {
        status: 400
      }
    );
  }

  return NextResponse.json(
    await createJobPosting({
      companyName: body.companyName.trim(),
      title: body.title.trim(),
      url: body.url.trim(),
      locationText: normalizeOptionalText(body.locationText),
      employmentType: normalizeOptionalText(body.employmentType),
      status: body.status,
      postedAt: normalizePostedAt(body.postedAt),
      sourceJobId: normalizeOptionalText(body.sourceJobId),
      initialVersion: {
        summary: normalizeOptionalText(body.initialVersion?.summary),
        rawText: normalizeOptionalText(body.initialVersion?.rawText),
        qualifications: Array.isArray(body.initialVersion?.qualifications)
          ? body.initialVersion?.qualifications.filter(Boolean)
          : parseCsv(body.initialVersion?.qualifications),
        preferredQualifications: Array.isArray(body.initialVersion?.preferredQualifications)
          ? body.initialVersion?.preferredQualifications.filter(Boolean)
          : parseCsv(body.initialVersion?.preferredQualifications),
        techStack: Array.isArray(body.initialVersion?.techStack)
          ? body.initialVersion?.techStack.filter(Boolean)
          : parseCsv(body.initialVersion?.techStack)
      }
    }),
    { status: 201 }
  );
}
