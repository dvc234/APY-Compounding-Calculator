import { InterestParams } from "../domain/InterestParams.js";

export class ScheduleGenerator {
  static evenlySpacedDays(compoundsPerYear: number, daysInYear: number): number[] {
    const n = Math.max(0, Math.floor(compoundsPerYear));
    if (n === 0) return [];
    const step = daysInYear / n;
    const schedule: number[] = [];

    for (let i = 1; i <= n; i++) {
      schedule.push(Math.round(step * i));
    }

    return schedule;
  }

  /**
   * Exponential fee-aware schedule: intervals shrink over time as the balance grows, making
   * compounding more frequent later in the year. This better reflects the accelerating return
   * of compound interest and produces a visibly exponential curve for the balance chart.
   */
  static feeAwareTimeline(params: InterestParams, targetCompounds?: number): { day: number; balance: number }[] {
    const daysInYear = params.daysInYear;
    const dailyRate = params.apr / daysInYear;
    const n = Math.max(0, Math.floor((targetCompounds ?? params.compoundsPerYear) || 0));

    let balance = Math.max(0, params.principal);
    let day = 0;
    const points: { day: number; balance: number }[] = [{ day, balance }];

    if (n === 0) {
      if (day < daysInYear) {
        const growth = balance * Math.pow(1 + dailyRate, daysInYear - day) - balance;
        points.push({ day: daysInYear, balance: balance + growth });
      }
      return points;
    }

    // If no fees apply, fall back to an even cadence (keeps previous expectations/tests)
    const isFeeFree = params.feePerCompound === 0 && params.feePct === 0;
    const dayPositions = isFeeFree
      ? ScheduleGenerator.evenlySpacedDays(n, daysInYear)
      : ScheduleGenerator.exponentialDays(n, daysInYear, params);

    for (const nextDayRaw of dayPositions) {
      const nextDay = Math.min(daysInYear, Math.max(day + 1, nextDayRaw));
      const growth = balance * Math.pow(1 + dailyRate, nextDay - day) - balance;
      balance = balance + growth;

      const fee = params.feePerCompound + balance * params.feePct;
      balance = Math.max(0, balance - fee);

      points.push({ day: nextDay, balance });
      day = nextDay;
    }

    if (day < daysInYear) {
      const growth = balance * Math.pow(1 + dailyRate, daysInYear - day) - balance;
      points.push({ day: daysInYear, balance: balance + growth });
    }

    return points;
  }

  /**
   * Generates exponentially shrinking intervals using a normalized decay curve:
   *   fraction(i) = (1 - e^{-k * (i/n)}) / (1 - e^{-k})
   * Larger k -> steeper acceleration (more compounding near year end).
   */
  private static exponentialDays(n: number, daysInYear: number, params: InterestParams): number[] {
    const k = this.curveSteepness(params);
    const denom = 1 - Math.exp(-k);
    const days: number[] = [];
    let prev = 0;

    for (let i = 1; i <= n; i++) {
      const fraction = denom === 0 ? i / n : (1 - Math.exp(-k * (i / n))) / denom;
      let day = Math.round(fraction * daysInYear);
      if (day <= prev) day = prev + 1;
      days.push(Math.min(day, daysInYear));
      prev = day;
    }

    // ensure the final event happens on or before the last day
    days[days.length - 1] = daysInYear;
    return days;
  }

  private static curveSteepness(params: InterestParams): number {
    // APR drives the baseline, fees amplify the need to wait until growth beats cost
    const base = Math.max(0.1, Math.min(1.5, params.apr * 4));
    const feeImpact = params.feePct * 15 + (params.feePerCompound / Math.max(1, params.principal)) * 5;
    return Math.min(2, base + feeImpact);
  }
}