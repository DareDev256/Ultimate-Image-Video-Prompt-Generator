/** Undo / redo stack. `push` records a new state; the first state pushed is the baseline. */
export class HistoryStack<T> {
  private items: T[] = [];
  private index = -1;
  constructor(private readonly limit = 30) {}

  push(state: T): void {
    this.items = this.items.slice(0, this.index + 1);
    this.items.push(state);
    if (this.items.length > this.limit + 1) this.items.shift();
    this.index = this.items.length - 1;
  }

  get canUndo(): boolean {
    return this.index > 0;
  }
  get canRedo(): boolean {
    return this.index < this.items.length - 1;
  }
  get current(): T | undefined {
    return this.items[this.index];
  }
  get first(): T | undefined {
    return this.items[0];
  }

  undo(): T | undefined {
    if (!this.canUndo) return undefined;
    this.index--;
    return this.items[this.index];
  }
  redo(): T | undefined {
    if (!this.canRedo) return undefined;
    this.index++;
    return this.items[this.index];
  }
  clear(): void {
    this.items = [];
    this.index = -1;
  }
}
