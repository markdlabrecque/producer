import { expect, test } from "vitest";
import { buildPrompt } from "../src/prompt.ts";

test("prompt contents", () => {
  const p = buildPrompt({ number: 7, title: "My title", body: "My body", url: "u" });
  expect(p).toContain("#7: My title");
  expect(p).toContain("My body");
  expect(p).toContain("Do not commit, push");
});
