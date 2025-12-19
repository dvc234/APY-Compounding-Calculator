import { describe, expect, it } from "vitest";
import { parsePercentageInput } from "../src/utils/parsePercentageInput.js";

describe("parsePercentageInput", () => {
  it("parses percent-suffixed input", () => {
    expect(parsePercentageInput('12%')).toBeCloseTo(0.12);
  });

  it("parses dot and comma decimals", () => {
    expect(parsePercentageInput("0.12")).toBeCloseTo(0.12);
    expect(parsePercentageInput("0,12")).toBeCloseTo(0.12);
  });

  it("treats whole-number input as percent when above 1", () => {
    expect(parsePercentageInput("12")).toBeCloseTo(0.12);
  });

  it("handles numeric input already in decimal form", () => {
    expect(parsePercentageInput(0.12)).toBeCloseTo(0.12);
  });
});
