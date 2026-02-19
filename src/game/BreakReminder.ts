/**
 * BreakReminder: prompts the player to take breaks at regular intervals.
 * Designed for kids — gentle, encouraging, non-intrusive.
 */

export interface BreakReminderCallbacks {
  onBreakSuggested: (minutesPlayed: number) => void;
}

export class BreakReminder {
  private intervalMs: number;
  private sessionStart = 0;
  private lastBreakAt = 0;
  private timerId = 0;
  private callbacks: BreakReminderCallbacks | null = null;
  private active = false;

  /**
   * @param intervalMinutes Minutes between break reminders (default 15).
   */
  constructor(intervalMinutes: number = 15) {
    this.intervalMs = intervalMinutes * 60_000;
  }

  start(callbacks: BreakReminderCallbacks): void {
    this.callbacks = callbacks;
    this.sessionStart = Date.now();
    this.lastBreakAt = Date.now();
    this.active = true;
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (!this.active) return;
    window.clearTimeout(this.timerId);
    this.timerId = window.setTimeout(() => {
      if (!this.active) return;
      const minutesPlayed = Math.round((Date.now() - this.sessionStart) / 60_000);
      this.callbacks?.onBreakSuggested(minutesPlayed);
      this.lastBreakAt = Date.now();
      this.scheduleNext(); // Schedule next reminder
    }, this.intervalMs);
  }

  /** Call when player acknowledges break (or dismisses). Resets the timer. */
  acknowledge(): void {
    this.lastBreakAt = Date.now();
    this.scheduleNext();
  }

  stop(): void {
    this.active = false;
    window.clearTimeout(this.timerId);
  }

  get minutesSinceLastBreak(): number {
    return Math.round((Date.now() - this.lastBreakAt) / 60_000);
  }

  get totalMinutesPlayed(): number {
    return Math.round((Date.now() - this.sessionStart) / 60_000);
  }
}
