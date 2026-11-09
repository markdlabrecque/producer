import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Harness, HarnessResult, Issue, Tracker } from "./contracts.ts";
import { branchName } from "./branch.ts";
import { buildPrompt } from "./prompt.ts";
import { newRunId, writeRecord } from "./record.ts";
import type { RunRecord } from "./record.ts";
import * as git from "./git.ts";

export interface RunArgs {
  repoRoot: string;
  issueNumber: number;
  tracker: Tracker;
  harness: Harness;
  now?: () => Date;
}

class StepError extends Error {}

function tail(text: string, n: number): string {
  return text.split("\n").slice(-n).join("\n");
}

export async function runIssue(args: RunArgs): Promise<{ record: RunRecord; recordPath: string }> {
  const { repoRoot, issueNumber, tracker, harness } = args;
  const now = args.now ?? (() => new Date());
  const startedAt = now();
  const record: RunRecord = {
    id: newRunId(startedAt),
    issue: null,
    branch: null,
    worktree: null,
    startedAt: startedAt.toISOString(),
    finishedAt: "",
    status: "failed",
    failedStep: null,
    reason: null,
    harness: null,
    prUrl: null,
  };

  let step = "fetch-issue";
  try {
    const issue: Issue = await tracker.getIssue(issueNumber);
    record.issue = { number: issue.number, title: issue.title, url: issue.url };

    step = "check-branch";
    const branch = branchName(issue);
    record.branch = branch;
    if ((await git.localBranchExists(repoRoot, branch)) || (await git.remoteBranchExists(repoRoot, branch))) {
      throw new StepError(`Branch ${branch} already exists`);
    }

    step = "create-worktree";
    const worktree = resolve(repoRoot, "..", "producer-worktrees", `issue-${issue.number}`);
    if (existsSync(worktree)) throw new StepError(`Worktree path ${worktree} already exists`);
    const base = await tracker.defaultBranch();
    await git.fetch(repoRoot, base);
    await git.addWorktree(repoRoot, worktree, branch, base);
    record.worktree = worktree;

    step = "harness";
    const result: HarnessResult = await harness.run(buildPrompt(issue), worktree);
    record.harness = result;
    if (result.exitCode !== 0) throw new StepError(`Harness exited with code ${result.exitCode}`);

    step = "commit";
    if (!(await git.hasChanges(worktree))) throw new StepError("Harness made no changes");
    await git.commitAll(worktree, `Issue #${issue.number}: ${issue.title}`);

    step = "push";
    await git.push(worktree, branch);

    step = "open-pr";
    const body =
      `Closes #${issue.number}\n\n` +
      `<details>\n<summary>Harness output (last 50 lines)</summary>\n\n` +
      "```\n" +
      tail(result.output, 50) +
      "\n```\n\n</details>";
    const pr = await tracker.openPullRequest({ head: branch, base, title: issue.title, body });
    record.prUrl = pr.url;

    step = "cleanup";
    await git.removeWorktree(repoRoot, worktree);
    record.worktree = worktree;
    record.status = "success";
  } catch (e) {
    record.status = "failed";
    record.failedStep = step;
    record.reason = e instanceof Error ? e.message : String(e);
  }

  record.finishedAt = now().toISOString();
  const recordPath = await writeRecord(repoRoot, record);
  return { record, recordPath };
}
