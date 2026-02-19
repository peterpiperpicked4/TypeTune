/**
 * Menu screen: theatrical title with spotlight effect, warm gold accents.
 * Semantic: uses h1 for title, proper landmark structure.
 */

export class MenuScreen {
  private container: HTMLElement;
  private onPlay: () => void;
  private onSettings: () => void;

  constructor(parent: HTMLElement, onPlay: () => void, onSettings: () => void) {
    this.onPlay = onPlay;
    this.onSettings = onSettings;

    this.container = document.createElement('div');
    this.container.className = 'screen menu-screen hidden';
    this.container.setAttribute('aria-label', 'TypeTune main menu');
    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0;
        background:
          radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212, 168, 83, 0.06) 0%, transparent 70%),
          radial-gradient(ellipse 80% 60% at 50% 100%, rgba(26, 20, 16, 0.8) 0%, transparent 60%);
        pointer-events: none;
      " aria-hidden="true"></div>

      <div style="text-align: center; position: relative; z-index: 1; animation: fadeIn 1s var(--tt-ease-out-expo) forwards; padding: 20px;">

        <div style="margin-bottom: 8px; opacity: 0; animation: fadeIn 0.8s 0.2s var(--tt-ease-out-expo) forwards;">
          <h1 style="
            font-family: var(--tt-font-display);
            font-size: clamp(48px, 10vw, 80px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
            line-height: 1;
            letter-spacing: -1px;
          ">TypeTune</h1>
        </div>

        <div style="
          font-family: var(--tt-font-main);
          font-size: clamp(10px, 1.5vw, 12px);
          font-weight: 500;
          color: var(--tt-text-muted);
          letter-spacing: 6px;
          text-transform: uppercase;
          margin-top: 12px;
          opacity: 0;
          animation: fadeIn 0.8s 0.4s var(--tt-ease-out-expo) forwards;
        " aria-hidden="true">The Typing Choir</div>

        <div style="
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--tt-accent), transparent);
          margin: clamp(20px, 4vw, 32px) auto;
          opacity: 0;
          animation: fadeIn 0.8s 0.5s var(--tt-ease-out-expo) forwards;
        " aria-hidden="true"></div>

        <p style="
          color: var(--tt-text-dim);
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 300;
          max-width: min(360px, 85vw);
          margin: 0 auto clamp(32px, 5vw, 48px);
          line-height: 1.7;
          opacity: 0;
          animation: fadeIn 0.8s 0.6s var(--tt-ease-out-expo) forwards;
        ">Type lyrics in rhythm to build a virtual choir<br>with the voice of Peter Hollens</p>

        <nav style="display: flex; flex-direction: column; gap: 14px; align-items: center; opacity: 0; animation: fadeIn 0.8s 0.8s var(--tt-ease-out-expo) forwards;" aria-label="Main menu">
          <button class="btn btn-primary play-btn" style="
            font-size: clamp(16px, 2.5vw, 18px);
            padding: 16px 56px;
            border-radius: 40px;
            letter-spacing: 1px;
            animation: spotlightPulse 3s ease infinite;
          ">Play</button>
          <button class="btn btn-secondary settings-btn" style="
            font-size: 13px;
            padding: 10px 28px;
            border-radius: 20px;
          ">Settings</button>
        </nav>

        <div style="
          margin-top: clamp(40px, 6vw, 64px);
          font-size: 11px;
          font-weight: 300;
          color: var(--tt-text-muted);
          letter-spacing: 1px;
          opacity: 0;
          animation: fadeIn 0.8s 1s var(--tt-ease-out-expo) forwards;
        ">Featuring the voice of <span style="color: var(--tt-accent); font-weight: 500;">Peter Hollens</span></div>
      </div>
    `;

    this.container.querySelector('.play-btn')!.addEventListener('click', () => this.onPlay());
    this.container.querySelector('.settings-btn')!.addEventListener('click', () => this.onSettings());

    parent.appendChild(this.container);
  }

  show(): void {
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }

  get element(): HTMLElement { return this.container; }
}
