/**
 * Raw inputs used to create sanitized interest parameters.
 */
export interface InterestParamsProps {
  apr: number;
  compoundsPerYear: number;
  principal?: number;
  feePerCompound?: number;
  feePct?: number;
  daysInYear?: number;
}

/**
 * Immutable view of the scenario being optimized. Inputs are normalized to safe,
 * non-negative values so downstream calculators can assume valid ranges.
 */
export class InterestParams {
  readonly apr: number;
  readonly compoundsPerYear: number;
  readonly principal: number;
  readonly feePerCompound: number;
  readonly feePct: number;
  readonly daysInYear: number;

  constructor({
    apr,
    compoundsPerYear,
    principal = 1,
    feePerCompound = 0,
    feePct = 0,
    daysInYear = 365,
  }: InterestParamsProps) {
    this.apr = apr;
    this.compoundsPerYear = Math.max(0, Math.floor(compoundsPerYear));
    this.principal = Math.max(0, principal);
    this.feePerCompound = Math.max(0, feePerCompound);
    this.feePct = Math.max(0, feePct);
    this.daysInYear = daysInYear > 0 ? daysInYear : 365;
  }

  /**
   * Returns a copy with a different compounding frequency.
   */
  withCompounds(compoundsPerYear: number): InterestParams {
    return new InterestParams({
      apr: this.apr,
      compoundsPerYear,
      principal: this.principal,
      feePerCompound: this.feePerCompound,
      feePct: this.feePct,
      daysInYear: this.daysInYear,
    });
  }

  /**
   * Returns a copy with a different principal value.
   */
  withPrincipal(principal: number): InterestParams {
    return new InterestParams({
      apr: this.apr,
      compoundsPerYear: this.compoundsPerYear,
      principal,
      feePerCompound: this.feePerCompound,
      feePct: this.feePct,
      daysInYear: this.daysInYear,
    });
  }
}