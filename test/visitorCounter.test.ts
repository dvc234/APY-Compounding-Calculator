import { describe, expect, it } from "vitest";
import { LocalVisitorCounter } from "../src/infra/LocalVisitorCounter.js";
import { ApiVisitorCounter, ApiClient } from "../src/infra/ApiVisitorCounter.js";

describe("Visitor counters", () => {
  it("increments and persists locally", async () => {
    const storage = {
      value: "0",
      getItem: (_: string) => storage.value,
      setItem: (_: string, v: string) => {
        storage.value = v;
      },
    };

    const counter = new LocalVisitorCounter("test", storage);
    expect(await counter.getCount()).toBe(0);
    await counter.increment();
    await counter.increment();
    expect(await counter.getCount()).toBe(2);
  });

  it("uses API client to fetch counts", async () => {
    let current = 3;
    const client: ApiClient = {
      fetch: async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes("increment")) {
          current += 1;
        }
        const response = {
          ok: true,
          status: 200,
          json: async () => ({ count: current }),
        } as unknown as Response;
        return response;
      },
    };

    const counter = new ApiVisitorCounter("https://api.example.com", client);
    expect(await counter.getCount()).toBe(3);
    expect(await counter.increment()).toBe(4);
  });
});