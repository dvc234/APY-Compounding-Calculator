import { InterestParams } from "../domain/InterestParams.js";
import { CalculationResult } from "../domain/CalculationResult.js";
import { ApyCalculator } from "./ApyCalculator.js";

export interface OptimalResult {
  n: number;
  result: CalculationResult;
  schedule?: number[];
}

export interface Optimizer {
  findOptimal(
    params: InterestParams,
    searchSpace: number[],
    calculator: ApyCalculator
  ): OptimalResult;
}