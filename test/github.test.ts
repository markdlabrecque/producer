import { expect, test } from "vitest";
import { createGithubTracker } from "../src/adapters/github.ts";
import type { Exec } from "../src/exec.ts";

function fake(code: number, stdout: string) {
  const calls: { cmd: string; args: string[]; opts: { cwd: string; input?: string } }[] = [];
  const exec: Exec = async (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    return { code, stdout, stderr: "boom" };
  };
  return { calls, exec };
}

test("getIssue", async () => {
  const f = fake(0, JSON.stringify({ number: 3, title: "t", body: "b", url: "u" }));
  const issue = await createGithubTracker("/x", f.exec).getIssue(3);
  expect(f.calls[0].cmd).toBe("gh");
  expect(f.calls[0].args).toEqual(["issue", "view", "3", "--json", "number,title,body,url"]);
  expect(issue.title).toBe("t");
});
test("openPullRequest", async () => {
  const f = fake(0, "creating\nhttps://github.com/o/r/pull/9\n\n");
  const r = await createGithubTracker("/x", f.exec).openPullRequest({ head: "h", base: "main", title: "T", body: "BODY" });
  expect(f.calls[0].args).toEqual(["pr", "create", "--head", "h", "--base", "main", "--title", "T", "--body-file", "-"]);
  expect(f.calls[0].opts.input).toBe("BODY");
  expect(r.url).toBe("https://github.com/o/r/pull/9");
});
test("non-zero throws", async () => {
  const f = fake(1, "");
  await expect(createGithubTracker("/x", f.exec).getIssue(1)).rejects.toThrow("failed (1)");
});
