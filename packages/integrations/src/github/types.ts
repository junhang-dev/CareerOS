export type GitHubImportTarget = "profile" | "repository" | "readme" | "contribution";

export type GitHubImportRequest = {
  userId: string;
  accountRef: string;
  targets: GitHubImportTarget[];
};

