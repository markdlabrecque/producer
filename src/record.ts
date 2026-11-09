import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { HarnessResult } from "./contracts.ts";

export interface RunRecord {
  id: string;
  issue: { number: number; title: string; url: string } | null;
  branch: string | null;
  worktree: string | null;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failed";
  failedStep: string | null;
  reason: string | null;
  harness: HarnessResult | null;
  prUrl: string | null;
}

export function newRunId(now: Date): string {
  const ts = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return `${ts}-${randomBytes(3).toString("hex")}`;
}

export async function writeRecord(repoRoot: string, record: RunRecord): Promise<string> {
  const dir = join(repoRoot, ".producer", "runs");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${record.id}.json`);
  await writeFile(path, JSON.stringify(record, null, 2) + "\n");
  return path;
}
