import type { Harness } from "../contracts.ts";
import { exec as realExec } from "../exec.ts";
import type { Exec } from "../exec.ts";

export function createPiHarness(exec: Exec = realExec): Harness {
  return {
    async run(prompt, cwd) {
      const r = await exec("pi", ["-p", "--no-session", prompt], { cwd });
      return { exitCode: r.code, output: r.stdout + r.stderr };
    },
  };
}
