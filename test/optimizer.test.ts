import { describe, expect, it } from "vitest";
import { BruteForceOptimizer } from "../src/services/BruteForceOptimizer.js";
import { CompoundFeeApyCalculator } from "../src/services/CompoundFeeApyCalculator.js";
import { InterestParams } from "../src/domain/InterestParams.js";

describe("BruteForceOptimizer", () => {
  const optimizer = new BruteForceOptimizer();
  const calculator = new CompoundFeeApyCalculator();

  it("prefers higher APY even with higher n", () => {
    const params = new InterestParams({ apr: 0.12, compoundsPerYear: 1, principal: 1000 });
    const result = optimizer.findOptimal(params, [1, 10], calculator);
    expect(result.n).toBe(10);
  });

  it("breaks ties by choosing the lower n", () => {
    const params = new InterestParams({ apr: 0, compoundsPerYear: 1, principal: 1000 });
    const result = optimizer.findOptimal(params, [1, 2, 3], calculator);
    expect(result.n).toBe(1);
    expect(result.result.realApy).toBe(0);
  });
});