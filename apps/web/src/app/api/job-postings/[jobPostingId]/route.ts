import { NextResponse } from "next/server";
import {
  getJobPostingDetail,
  updateJobPosting
} from "../../../../server/services/job-postings";

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

type RouteContext = {
  params: Promise<{
    jobPostingId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const params = await context.params;
  const detail = await getJobPostingDetail(params.jobPostingId);

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

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = (await request.json()) as {
    companyName?: string;
    title?: string;
    url?: string;
    locationText?: string;
    employmentType?: string;
    status?: "active" | "closed" | "unknown";
    postedAt?: string;
    sourceJobId?: string;
    latestVersion?: {
      summary?: string;
      rawText?: string;
      qualifications?: string[] | string;
      preferredQualifications?: string[] | string;
      techStack?: string[] | string;
    };
  };

  if (!body.companyName || !body.title || !body.url || !body.status) {
    return NextResponse.json(
      {
        error: "companyName, title, url, status가 필요하다."
      },
      {
        status: 400
      }
    );
  }

  const updated = await updateJobPosting({
    id: params.jobPostingId,
    companyName: body.companyName.trim(),
    title: body.title.trim(),
    url: body.url.trim(),
    locationText: normalizeOptionalText(body.locationText),
    employmentType: normalizeOptionalText(body.employmentType),
    status: body.status,
    postedAt: normalizePostedAt(body.postedAt),
    sourceJobId: normalizeOptionalText(body.sourceJobId),
    latestVersion: {
      summary: normalizeOptionalText(body.latestVersion?.summary),
      rawText: normalizeOptionalText(body.latestVersion?.rawText),
      qualifications: Array.isArray(body.latestVersion?.qualifications)
        ? body.latestVersion?.qualifications.filter(Boolean)
        : parseCsv(body.latestVersion?.qualifications),
      preferredQualifications: Array.isArray(body.latestVersion?.preferredQualifications)
        ? body.latestVersion?.preferredQualifications.filter(Boolean)
        : parseCsv(body.latestVersion?.preferredQualifications),
      techStack: Array.isArray(body.latestVersion?.techStack)
        ? body.latestVersion?.techStack.filter(Boolean)
        : parseCsv(body.latestVersion?.techStack)
    }
  });

  if (!updated) {
    return NextResponse.json({ error: "job posting not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
