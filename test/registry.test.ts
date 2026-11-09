import { expect, test } from "vitest";
import { createHarness, createTracker } from "../src/registry.ts";

test("known", () => {
  expect(createTracker("github", ".")).toBeTruthy();
  expect(createHarness("pi")).toBeTruthy();
});
test("unknown", () => {
  expect(() => createTracker("x", ".")).toThrow("Known: github");
  expect(() => createHarness("x")).toThrow("Known: pi");
});
