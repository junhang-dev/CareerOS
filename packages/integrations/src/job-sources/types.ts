export type JobSourceFetchContext = {
  sourceName: string;
  cursor?: string;
  rateLimitKey?: string;
};

export type JobPostingCandidate = {
  sourceJobId?: string;
  url: string;
  title?: string;
  companyName?: string;
  locationText?: string;
  summaryText?: string;
  metadata?: Record<string, unknown>;
};

export type JobPostingDetail = {
  url: string;
  rawHtml?: string;
  rawText?: string;
  attachments: Array<{
    url: string;
    kind: "pdf" | "doc" | "link" | "image";
  }>;
  metadata: Record<string, unknown>;
};

export interface JobSourceAdapter {
  readonly sourceName: string;
  fetchListing(context: JobSourceFetchContext): Promise<JobPostingCandidate[]>;
  fetchDetail(url: string): Promise<JobPostingDetail>;
}

/**
 * TODO:
 * - 각 소스별 anti-bot 정책과 robots 정책을 어댑터 메타데이터에 포함한다.
 * - 브라우저 자동화가 필요한 소스와 단순 HTTP 파싱 가능 소스를 분리한다.
 */

