export interface CalculationResult {
  grossApy: number;
  realApy: number;
  totalFees: number;
  netBalance: number;
  netGain: number;
  optimalCompoundsPerYear?: number;
  schedule?: number[];
}