import type { Issue, PullRequestInput, Tracker } from "../contracts.ts";
import { exec as realExec, execOk } from "../exec.ts";
import type { Exec } from "../exec.ts";

export function createGithubTracker(cwd: string, exec: Exec = realExec): Tracker {
  return {
    async getIssue(n: number): Promise<Issue> {
      const out = await execOk(exec, "gh", ["issue", "view", String(n), "--json", "number,title,body,url"], { cwd });
      return JSON.parse(out) as Issue;
    },
    async defaultBranch(): Promise<string> {
      const out = await execOk(exec, "gh", ["repo", "view", "--json", "defaultBranchRef"], { cwd });
      return (JSON.parse(out) as { defaultBranchRef: { name: string } }).defaultBranchRef.name;
    },
    async openPullRequest(pr: PullRequestInput): Promise<{ url: string }> {
      const out = await execOk(
        exec,
        "gh",
        ["pr", "create", "--head", pr.head, "--base", pr.base, "--title", pr.title, "--body-file", "-"],
        { cwd, input: pr.body },
      );
      const lines = out.split("\n").map((l) => l.trim()).filter(Boolean);
      return { url: lines[lines.length - 1] ?? "" };
    },
  };
}
