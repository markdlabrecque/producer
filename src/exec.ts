import { spawn } from "node:child_process";

export type Exec = (
  cmd: string,
  args: string[],
  opts: { cwd: string; input?: string },
) => Promise<{ code: number; stdout: string; stderr: string }>;

export const exec: Exec = (cmd, args, opts) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
    child.stdin.on("error", () => {});
    if (opts.input !== undefined) child.stdin.write(opts.input);
    child.stdin.end();
  });

export async function execOk(
  run: Exec,
  cmd: string,
  args: string[],
  opts: { cwd: string; input?: string },
): Promise<string> {
  const r = await run(cmd, args, opts);
  if (r.code !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed (${r.code}): ${r.stderr.trim()}`);
  }
  return r.stdout;
}
