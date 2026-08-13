/**
 * Simple async mutex for refresh-token single-flight.
 * Avoids adding an extra dependency.
 */
export class Mutex {
  private locked = false;
  private waiters: (() => void)[] = [];

  isLocked(): boolean {
    return this.locked;
  }

  async acquire(): Promise<() => void> {
    while (this.locked) {
      await new Promise<void>((resolve) => {
        this.waiters.push(resolve);
      });
    }
    this.locked = true;
    return () => {
      this.locked = false;
      const next = this.waiters.shift();
      next?.();
    };
  }

  async waitForUnlock(): Promise<void> {
    if (!this.locked) {
      return;
    }
    await new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  }
}
