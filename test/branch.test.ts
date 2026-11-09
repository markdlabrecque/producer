import { expect, test } from "vitest";
import { branchName } from "../src/branch.ts";

test("slugifies title", () => {
  expect(branchName({ number: 3, title: "Add a CONTRIBUTING.md stub" })).toBe("issue-3-add-a-contributing-md-stub");
});
test("cuts long slug without trailing dash", () => {
  const n = branchName({ number: 4, title: "word ".repeat(30) });
  const slug = n.replace("issue-4-", "");
  expect(slug.length).toBeLessThanOrEqual(40);
  expect(slug.endsWith("-")).toBe(false);
});
test("symbols only", () => {
  expect(branchName({ number: 5, title: "!!! ???" })).toBe("issue-5");
});
