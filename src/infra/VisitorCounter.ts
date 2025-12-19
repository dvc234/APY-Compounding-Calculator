export interface VisitorCounter {
  getCount(): Promise<number>;
  increment(): Promise<number>;
}