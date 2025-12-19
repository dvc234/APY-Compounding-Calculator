export interface InterestParamsProps {
  apr: number;
  compoundsPerYear: number;
  principal?: number;
  feePerCompound?: number;
  feePct?: number;
  daysInYear?: number;
}

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