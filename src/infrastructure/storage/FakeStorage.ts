import type { StoragePort } from '../../core/ports/ports';

export class FakeStorage implements StoragePort {
  private readonly values = new Map<string, string>();
  read(key: string): string | null { return this.values.get(key) ?? null; }
  write(key: string, value: string): void { this.values.set(key, value); }
}
