import { InterestParams } from "../domain/InterestParams.js";
import { CalculationResult } from "../domain/CalculationResult.js";
import { ApyCalculator } from "./ApyCalculator.js";

export class CompoundFeeApyCalculator implements ApyCalculator {
  calculate(params: InterestParams): CalculationResult {
    const n = Math.floor(params.compoundsPerYear);
    const principal = params.principal;

    if (n === 0) {
      return {
        grossApy: params.apr,
        realApy: params.apr,
        totalFees: 0,
        netBalance: principal + (principal * params.apr),
        netGain: principal * params.apr,
      };
    }

    if (principal <= 0) {
      return {
        grossApy: this.grossApy(params.apr, n),
        realApy: 0,
        totalFees: 0,
        netBalance: 0,
        netGain: 0,
      };
    }

    const periodRate = params.apr / n;
    let balance = principal;
    let totalFees = 0;

    for (let i = 0; i < n; i++) {
      balance *= 1 + periodRate;

      const fee = params.feePerCompound + balance * params.feePct;
      totalFees += fee;
      balance -= fee;

      if (balance < 0) {
        balance = 0;
        break;
      }
    }

    const netGain = balance - principal;
    const realApy = principal > 0 ? balance / principal - 1 : 0;

    return {
      grossApy: this.grossApy(params.apr, n),
      realApy,
      totalFees,
      netBalance: balance,
      netGain,
    };
  }

  private grossApy(apr: number, n: number): number {
    return Math.pow(1 + apr / n, n) - 1;
  }
}