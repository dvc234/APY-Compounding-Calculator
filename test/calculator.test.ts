import { describe, expect, it } from "vitest";
import { CompoundFeeApyCalculator } from "../src/services/CompoundFeeApyCalculator.js";
import { InterestParams } from "../src/domain/InterestParams.js";

describe("CompoundFeeApyCalculator", () => {
  const calculator = new CompoundFeeApyCalculator();

  it("matches analytical gross APY when fees are zero", () => {
    const params = new InterestParams({ apr: 0.1, compoundsPerYear: 12, principal: 1000 });
    const result = calculator.calculate(params);
    const expectedGross = Math.pow(1 + 0.1 / 12, 12) - 1;

    expect(result.grossApy).toBeCloseTo(expectedGross, 10);
    expect(result.realApy).toBeCloseTo(expectedGross, 10);
    expect(result.totalFees).toBe(0);
    expect(result.netBalance).toBeCloseTo(params.principal * (1 + expectedGross), 8);
  });

  it("never returns a negative balance even with high flat fees", () => {
    const params = new InterestParams({ apr: 0.05, compoundsPerYear: 365, principal: 100, feePerCompound: 1 });
    const result = calculator.calculate(params);

    expect(result.netBalance).toBeGreaterThanOrEqual(0);
    expect(result.realApy).toBeLessThanOrEqual(0);
  });

  it("reduces real APY when percentage fees are applied", () => {
    const base = new InterestParams({ apr: 0.2, compoundsPerYear: 12, principal: 1000 });
    const withFees = new InterestParams({ apr: 0.2, compoundsPerYear: 12, principal: 1000, feePct: 0.01 });

    const baseResult = calculator.calculate(base);
    const feeResult = calculator.calculate(withFees);

    expect(feeResult.realApy).toBeLessThan(baseResult.realApy);
    expect(feeResult.totalFees).toBeGreaterThan(0);
  });
});