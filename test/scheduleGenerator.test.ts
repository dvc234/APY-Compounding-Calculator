import { describe, expect, it } from "vitest";
import { ScheduleGenerator } from "../src/services/ScheduleGenerator.js";
import { InterestParams } from "../src/domain/InterestParams.js";

describe("ScheduleGenerator.feeAwareTimeline", () => {
  it("produces non-decreasing days and ends at year end", () => {
    const params = new InterestParams({ apr: 0.12, compoundsPerYear: 12, principal: 1000, feePerCompound: 1 });
    const points = ScheduleGenerator.feeAwareTimeline(params, 12);

    expect(points[0].day).toBe(0);
    expect(points[points.length - 1].day).toBe(params.daysInYear);

    for (let i = 1; i < points.length; i++) {
      expect(points[i].day).toBeGreaterThanOrEqual(points[i - 1].day);
    }
  });

  it("falls back to near-even spacing when fees are zero", () => {
    const params = new InterestParams({ apr: 0.1, compoundsPerYear: 12, principal: 1000, feePerCompound: 0 });
    const points = ScheduleGenerator.feeAwareTimeline(params, 12);

    const deltas = points.slice(1).map((p, idx) => p.day - points[idx].day).filter((d) => d > 0);
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

    expect(avgDelta).toBeCloseTo(params.daysInYear / 12, 0);
    expect(points[points.length - 1].day).toBe(params.daysInYear);
  });

  it("shrinks intervals over time when fees apply, yielding an exponential cadence", () => {
    const params = new InterestParams({ apr: 0.12, compoundsPerYear: 8, principal: 2000, feePerCompound: 2 });
    const points = ScheduleGenerator.feeAwareTimeline(params, 8);

    const deltas = points.slice(1).map((p, idx) => p.day - points[idx].day).filter((d) => d > 0);
    const firstGap = deltas[0];
    const lastGap = deltas[deltas.length - 1];

    expect(firstGap).toBeGreaterThan(lastGap);
    expect(points[points.length - 1].day).toBe(params.daysInYear);
  });

  it("returns only start and end points when no compounding is chosen", () => {
    const params = new InterestParams({ apr: 0.1, compoundsPerYear: 0, principal: 1000, feePerCompound: 0 });
    const points = ScheduleGenerator.feeAwareTimeline(params, 0);

    expect(points.length).toBe(2);
    expect(points[0]).toEqual({ day: 0, balance: params.principal });
    expect(points[1].day).toBe(params.daysInYear);
    expect(points[1].balance).toBeGreaterThan(points[0].balance);
  });
});