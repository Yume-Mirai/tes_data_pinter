import { IScheduler } from "../core/IScheduler";

export class SimpleScheduler implements IScheduler {
  private intervals = new Map<string, NodeJS.Timeout>();

  scheduleRecurring(
    name: string,
    intervalMs: number,
    fn: () => void | Promise<void>
  ): void {
    if (this.intervals.has(name)) {
      throw new Error(`Scheduler with name '${name}' already exists`);
    }

    const interval = setInterval(async () => {
      try {
        await fn();
      } catch (error) {
        console.error(`Error in scheduled task '${name}':`, error);
      }
    }, intervalMs);

    this.intervals.set(name, interval);
  }

  stop(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
  }
}
