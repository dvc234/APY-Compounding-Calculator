export class ScheduleGenerator {
  static evenlySpacedDays(compoundsPerYear: number, daysInYear: number): number[] {
    const n = Math.max(1, Math.floor(compoundsPerYear));
    const step = daysInYear / n;
    const schedule: number[] = [];

    for (let i = 1; i <= n; i++) {
      schedule.push(Math.round(step * i));
    }

    return schedule;
  }
}