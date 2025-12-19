import { InterestParams } from "../domain/InterestParams.js";
import { CalculationResult } from "../domain/CalculationResult.js";

export interface ApyCalculator {
  calculate(params: InterestParams): CalculationResult;
}