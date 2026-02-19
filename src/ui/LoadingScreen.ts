/**
 * Loading screen: atmospheric loading with responsive progress bar.
 */

export class LoadingScreen {
  private container: HTMLElement;
  private messageEl: HTMLElement;
  private progressEl: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'screen loading-screen hidden';
    this.container.setAttribute('role', 'alert');
    this.container.setAttribute('aria-busy', 'true');
    this.container.setAttribute('aria-label', 'Loading song');

    this.container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="
          font-family: var(--tt-font-display);
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 300;
          font-style: italic;
          margin-bottom: 28px;
          color: var(--tt-text);
        ">Preparing the stage&hellip;</div>

        <div class="loading-message" style="
          font-size: 13px;
          color: var(--tt-text-muted);
          margin-bottom: 24px;
          font-weight: 300;
          letter-spacing: 0.5px;
        " aria-live="polite">Loading vocal samples</div>

        <div style="
          width: min(180px, 50vw);
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 1px;
          overflow: hidden;
          margin: 0 auto;
        " role="progressbar" aria-label="Loading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="loading-progress" style="
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, var(--tt-accent), var(--tt-accent-glow));
            border-radius: 1px;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s var(--tt-ease-out);
            will-change: transform;
            box-shadow: 0 0 8px rgba(212, 168, 83, 0.3);
          "></div>
        </div>
      </div>
    `;

    this.messageEl = this.container.querySelector('.loading-message')!;
    this.progressEl = this.container.querySelector('.loading-progress')!;

    parent.appendChild(this.container);
  }

  setMessage(msg: string): void {
    this.messageEl.textContent = msg;
  }

  setProgress(pct: number): void {
    this.progressEl.style.transform = `scaleX(${pct})`;
    const bar = this.progressEl.parentElement;
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(pct * 100)));
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
    this.container.setAttribute('aria-busy', 'false');
  }

  get element(): HTMLElement { return this.container; }
}
