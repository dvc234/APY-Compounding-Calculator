import { InterestParams } from "../domain/InterestParams.js";
import { OptimalResult, Optimizer } from "./Optimizer.js";
import { ApyCalculator } from "./ApyCalculator.js";
import { ScheduleGenerator } from "./ScheduleGenerator.js";

export class BruteForceOptimizer implements Optimizer {
  findOptimal(
    params: InterestParams,
    searchSpace: number[],
    calculator: ApyCalculator
  ): OptimalResult {
    const uniqueSearch = Array.from(new Set(searchSpace)).filter((n) => n >= 0);
    uniqueSearch.sort((a, b) => a - b);

    if (uniqueSearch.length === 0) {
      throw new Error("searchSpace must contain at least one compound count >= 0");
    }

    let best: OptimalResult | null = null;

    for (const n of uniqueSearch) {
      const result = calculator.calculate(params.withCompounds(n));
      if (!best || result.realApy > best.result.realApy || (result.realApy === best.result.realApy && n < best.n)) {
        const schedule = ScheduleGenerator.evenlySpacedDays(n, params.daysInYear);
        best = { n, result: { ...result, optimalCompoundsPerYear: n, schedule }, schedule };
      }
    }

    if (!best) {
      throw new Error("Failed to evaluate optimization search space");
    }

    return best;
  }
}