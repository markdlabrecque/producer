import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import type { Harness, PullRequestInput, Tracker } from "../src/contracts.ts";
import { runIssue } from "../src/run.ts";

const git = (cwd: string, ...a: string[]) => execFileSync("git", a, { cwd, encoding: "utf8" });

async function setup() {
  const tmp = await mkdtemp(join(tmpdir(), "run-"));
  const origin = join(tmp, "origin.git");
  const repo = join(tmp, "repo");
  git(tmp, "init", "--bare", "-b", "main", origin);
  git(tmp, "clone", origin, repo);
  git(repo, "config", "user.name", "T");
  git(repo, "config", "user.email", "t@example.com");
  git(repo, "checkout", "-B", "main");
  await writeFile(join(repo, "a.txt"), "a");
  git(repo, "add", "-A");
  git(repo, "commit", "-m", "init");
  git(repo, "push", "-u", "origin", "main");
  const prs: PullRequestInput[] = [];
  const tracker: Tracker = {
    getIssue: async (n) => ({ number: n, title: "Add hello", body: "body", url: "http://i/3" }),
    defaultBranch: async () => "main",
    openPullRequest: async (pr) => {
      prs.push(pr);
      return { url: "http://pr/1" };
    },
  };
  return { tmp, origin, repo, prs, tracker };
}

test("success", async () => {
  const s = await setup();
  const harness: Harness = {
    run: async (_p, cwd) => {
      await writeFile(join(cwd, "hello.txt"), "hi");
      return { exitCode: 0, output: "done" };
    },
  };
  const { record, recordPath } = await runIssue({ repoRoot: s.repo, issueNumber: 3, tracker: s.tracker, harness });
  expect(record.status).toBe("success");
  expect(s.prs).toHaveLength(1);
  expect(s.prs[0].head).toMatch(/^issue-3-/);
  expect(s.prs[0].base).toBe("main");
  expect(s.prs[0].body.startsWith("Closes #3")).toBe(true);
  expect(git(s.origin, "log", "-1", "--format=%s", s.prs[0].head).trim()).toBe("Issue #3: Add hello");
  expect(existsSync(join(s.tmp, "producer-worktrees", "issue-3"))).toBe(false);
  expect(JSON.parse(await readFile(recordPath, "utf8")).prUrl).toBe("http://pr/1");
});

test("harness fails", async () => {
  const s = await setup();
  const harness: Harness = { run: async () => ({ exitCode: 1, output: "bad" }) };
  const { record } = await runIssue({ repoRoot: s.repo, issueNumber: 3, tracker: s.tracker, harness });
  expect(record.status).toBe("failed");
  expect(record.failedStep).toBe("harness");
  expect(s.prs).toHaveLength(0);
  expect(existsSync(join(s.tmp, "producer-worktrees", "issue-3"))).toBe(true);
});

test("no changes", async () => {
  const s = await setup();
  const harness: Harness = { run: async () => ({ exitCode: 0, output: "" }) };
  const { record } = await runIssue({ repoRoot: s.repo, issueNumber: 3, tracker: s.tracker, harness });
  expect(record.failedStep).toBe("commit");
  expect(record.reason).toBe("Harness made no changes");
  expect(s.prs).toHaveLength(0);
});

test("branch exists", async () => {
  const s = await setup();
  git(s.repo, "branch", "issue-3-add-hello");
  let called = false;
  const harness: Harness = { run: async () => ((called = true), { exitCode: 0, output: "" }) };
  const { record } = await runIssue({ repoRoot: s.repo, issueNumber: 3, tracker: s.tracker, harness });
  expect(record.failedStep).toBe("check-branch");
  expect(called).toBe(false);
});
