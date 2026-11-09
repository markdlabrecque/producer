import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { loadConfig } from "../src/config.ts";

async function repo(config?: string) {
  const d = await mkdtemp(join(tmpdir(), "cfg-"));
  if (config !== undefined) {
    await mkdir(join(d, ".producer"));
    await writeFile(join(d, ".producer", "config.json"), config);
  }
  return d;
}

test("valid", async () => {
  expect(await loadConfig(await repo('{"tracker":"github","harness":"pi"}'))).toEqual({ tracker: "github", harness: "pi" });
});
test("missing file", async () => {
  await expect(loadConfig(await repo())).rejects.toThrow("No .producer/config.json");
});
test("missing key", async () => {
  await expect(loadConfig(await repo('{"tracker":"github"}'))).rejects.toThrow('"harness" must be a non-empty string');
});
