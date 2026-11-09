import type { Issue } from "./contracts.ts";

export function buildPrompt(issue: Issue): string {
  return `You are working on GitHub issue #${issue.number}: ${issue.title}

${issue.body}

Instructions:
- Implement the issue in this repository.
- Run the project's tests if it has any, and make them pass.
- Do not commit, push, or open a pull request. Leave your changes in the working tree.`;
}
