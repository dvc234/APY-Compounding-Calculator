import { VisitorCounter } from "./VisitorCounter.js";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const memoryStorage: StorageLike = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
})();

function resolveStorage(): StorageLike {
  if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage as StorageLike;
  }
  return memoryStorage;
}

export class LocalVisitorCounter implements VisitorCounter {
  private readonly storage: StorageLike;
  private readonly key: string;

  constructor(key = "visitor_count", storage: StorageLike = resolveStorage()) {
    this.key = key;
    this.storage = storage;
  }

  async getCount(): Promise<number> {
    const raw = this.storage.getItem(this.key);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  async increment(): Promise<number> {
    const next = (await this.getCount()) + 1;
    this.storage.setItem(this.key, String(next));
    return next;
  }
}