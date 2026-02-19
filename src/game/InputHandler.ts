/**
 * Input handler: captures keyboard events and routes to game logic.
 */

export type KeyCallback = (key: string) => void;

export class InputHandler {
  private callback: KeyCallback | null = null;
  private active = false;
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  start(callback: KeyCallback): void {
    this.callback = callback;
    this.active = true;

    // Blur any focused element so space/enter don't trigger buttons
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.boundHandler = (e: KeyboardEvent) => {
      if (!this.active || !this.callback) return;

      // Only handle printable characters and space
      if (e.key.length === 1 || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.callback(e.key.toLowerCase());
      }
    };

    // Use capture phase to intercept before buttons handle the event
    window.addEventListener('keydown', this.boundHandler, true);
  }

  stop(): void {
    this.active = false;
    if (this.boundHandler) {
      window.removeEventListener('keydown', this.boundHandler, true);
      this.boundHandler = null;
    }
    this.callback = null;
  }

  pause(): void {
    this.active = false;
  }

  resume(): void {
    this.active = true;
  }
}
