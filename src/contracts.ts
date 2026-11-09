export interface Issue {
  number: number;
  title: string;
  body: string;
  url: string;
}

export interface PullRequestInput {
  head: string;
  base: string;
  title: string;
  body: string;
}

export interface Tracker {
  getIssue(n: number): Promise<Issue>;
  defaultBranch(): Promise<string>;
  openPullRequest(pr: PullRequestInput): Promise<{ url: string }>;
}

export interface HarnessResult {
  exitCode: number;
  output: string;
}

export interface Harness {
  run(prompt: string, cwd: string): Promise<HarnessResult>;
}
