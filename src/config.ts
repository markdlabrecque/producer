import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function loadConfig(repoRoot: string): Promise<{ tracker: string; harness: string }> {
  let raw: string;
  try {
    raw = await readFile(join(repoRoot, ".producer", "config.json"), "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`No .producer/config.json in ${repoRoot}`);
    }
    throw e;
  }
  const data = JSON.parse(raw) as Record<string, unknown>;
  for (const key of ["tracker", "harness"]) {
    const v = data[key];
    if (typeof v !== "string" || v === "") {
      throw new Error(`.producer/config.json: "${key}" must be a non-empty string`);
    }
  }
  return { tracker: data.tracker as string, harness: data.harness as string };
}
