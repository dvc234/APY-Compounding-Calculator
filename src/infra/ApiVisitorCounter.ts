import { VisitorCounter } from "./VisitorCounter.js";

export interface ApiClient {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

const defaultClient: ApiClient = {
  fetch: (...args) => fetch(...args),
};

export class ApiVisitorCounter implements VisitorCounter {
  constructor(private readonly baseUrl: string, private readonly client: ApiClient = defaultClient) {}

  async getCount(): Promise<number> {
    const res = await this.client.fetch(new URL("/count", this.baseUrl), { method: "GET" });
    if (!res.ok) throw new Error(`Failed to get visitor count (${res.status})`);
    const body = (await res.json()) as { count?: number };
    return body.count ?? 0;
  }

  async increment(): Promise<number> {
    const res = await this.client.fetch(new URL("/increment", this.baseUrl), { method: "POST" });
    if (!res.ok) throw new Error(`Failed to increment visitor count (${res.status})`);
    const body = (await res.json()) as { count?: number };
    return body.count ?? 0;
  }
}