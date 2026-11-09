import { expect, test } from "vitest";
import { createPiHarness } from "../src/adapters/pi.ts";
import type { Exec } from "../src/exec.ts";

test("runs pi and returns non-zero", async () => {
  let seen: unknown[] = [];
  const exec: Exec = async (cmd, args, opts) => {
    seen = [cmd, args, opts.cwd];
    return { code: 2, stdout: "out", stderr: "err" };
  };
  const r = await createPiHarness(exec).run("PROMPT", "/wt");
  expect(seen).toEqual(["pi", ["-p", "--no-session", "PROMPT"], "/wt"]);
  expect(r).toEqual({ exitCode: 2, output: "outerr" });
});
