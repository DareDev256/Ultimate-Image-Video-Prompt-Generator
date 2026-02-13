import { existsSync, readFileSync, writeFileSync } from 'fs';

/**
 * Generic JSON file storage — eliminates repeated load/save boilerplate
 * across config, favorites, and presets modules.
 */
export class JsonStore<T> {
  constructor(
    private filePath: string,
    private defaultValue: T,
    private ensureDir: () => void,
  ) {}

  load(): T {
    this.ensureDir();
    if (!existsSync(this.filePath))
      return JSON.parse(JSON.stringify(this.defaultValue));
    return JSON.parse(readFileSync(this.filePath, 'utf-8'));
  }

  save(data: T): void {
    this.ensureDir();
    writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }
}
