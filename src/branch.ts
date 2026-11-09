import type { Issue } from "./contracts.ts";

export function branchName(issue: Pick<Issue, "number" | "title">): string {
  const slug = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  return slug ? `issue-${issue.number}-${slug}` : `issue-${issue.number}`;
}
