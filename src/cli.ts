#!/usr/bin/env node
import { loadConfig } from "./config.ts";
import { repoRoot } from "./git.ts";
import { createHarness, createTracker } from "./registry.ts";
import { runIssue } from "./run.ts";

const usage = () => {
  console.error("Usage: producer run <issue-number>");
  process.exit(2);
};

const [cmd, num, ...rest] = process.argv.slice(2);
if (cmd !== "run" || num === undefined || rest.length > 0 || !/^[1-9][0-9]*$/.test(num)) usage();
const issueNumber = Number(num);

try {
  const root = await repoRoot(process.cwd());
  const config = await loadConfig(root);
  const tracker = createTracker(config.tracker, root);
  const harness = createHarness(config.harness);
  const { record, recordPath } = await runIssue({ repoRoot: root, issueNumber, tracker, harness });
  if (record.status === "success") {
    console.log(record.prUrl);
    console.log(recordPath);
    process.exit(0);
  }
  console.error(`Failed at ${record.failedStep}: ${record.reason}`);
  console.error(recordPath);
  if (record.worktree) console.error(record.worktree);
  process.exit(1);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
