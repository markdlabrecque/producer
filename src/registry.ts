import type { Harness, Tracker } from "./contracts.ts";
import { createGithubTracker } from "./adapters/github.ts";
import { createPiHarness } from "./adapters/pi.ts";

export function createTracker(name: string, cwd: string): Tracker {
  if (name === "github") return createGithubTracker(cwd);
  throw new Error(`Unknown tracker "${name}". Known: github`);
}

export function createHarness(name: string): Harness {
  if (name === "pi") return createPiHarness();
  throw new Error(`Unknown harness "${name}". Known: pi`);
}
