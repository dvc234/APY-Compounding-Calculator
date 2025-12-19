export interface ChartPoint {
  n: number;
  realApy: number;
}

export interface ChartService {
  renderApyVsCompounds(data: ChartPoint[], optimalN: number): unknown;
  renderScheduleTimeline(schedule: number[]): unknown;
  renderScheduleCurve(points: { day: number; balance: number }[], currencySymbol: string): unknown;
}