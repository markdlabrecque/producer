import { exec, execOk } from "./exec.ts";

const git = (cwd: string, ...args: string[]) => execOk(exec, "git", args, { cwd });

export async function repoRoot(cwd: string): Promise<string> {
  return (await git(cwd, "rev-parse", "--show-toplevel")).trim();
}

export async function localBranchExists(root: string, b: string): Promise<boolean> {
  const r = await exec("git", ["rev-parse", "--verify", "--quiet", `refs/heads/${b}`], { cwd: root });
  return r.code === 0;
}

export async function remoteBranchExists(root: string, b: string): Promise<boolean> {
  return (await git(root, "ls-remote", "--heads", "origin", b)).trim() !== "";
}

export async function fetch(root: string, base: string): Promise<void> {
  await git(root, "fetch", "origin", base);
}

export async function addWorktree(root: string, path: string, branch: string, base: string): Promise<void> {
  await git(root, "worktree", "add", "-b", branch, path, `origin/${base}`);
}

export async function hasChanges(wt: string): Promise<boolean> {
  return (await git(wt, "status", "--porcelain")).trim() !== "";
}

export async function commitAll(wt: string, message: string): Promise<void> {
  await git(wt, "add", "-A");
  await git(wt, "commit", "-m", message);
}

export async function push(wt: string, branch: string): Promise<void> {
  await git(wt, "push", "-u", "origin", branch);
}

export async function removeWorktree(root: string, path: string): Promise<void> {
  await git(root, "worktree", "remove", path);
}
