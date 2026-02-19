/**
 * Settings screen: accessible sliders with aria-labels, larger toggle targets.
 */

import type { PlayerSettings, Syllable } from '../data/types';

export class SettingsScreen {
  private container: HTMLElement;
  private onBack: () => void;
  private onUpdate: (settings: Partial<PlayerSettings>) => void;
  private onCalibrate: () => void;

  constructor(parent: HTMLElement, initialSettings: PlayerSettings, onBack: () => void, onUpdate: (settings: Partial<PlayerSettings>) => void, onCalibrate: () => void) {
    this.onBack = onBack;
    this.onUpdate = onUpdate;
    this.onCalibrate = onCalibrate;

    this.container = document.createElement('div');
    this.container.className = 'screen settings-screen hidden';
    this.container.style.cssText = 'padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);';

    this.render(initialSettings);
    parent.appendChild(this.container);
  }

  private render(settings: PlayerSettings): void {
    this.container.innerHTML = `
      <div style="max-width: 460px; width: 100%; margin: 0 auto;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 48px;">
          <button class="btn btn-secondary back-btn" style="font-size: 13px; padding: 8px 18px; border-radius: 20px;">Back</button>
          <h2 style="
            font-family: var(--tt-font-display);
            font-size: clamp(24px, 4vw, 32px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
          ">Settings</h2>
          <div style="width: 60px;"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0;">
          <div style="
            font-size: 10px;
            font-weight: 500;
            color: var(--tt-text-muted);
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 20px;
          " aria-hidden="true">Audio</div>

          <fieldset style="border: none; padding: 0; margin: 0;">
            <legend class="sr-only" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);">Audio settings</legend>
            ${this.sliderRow('Master Volume', 'masterVolume', settings.masterVolume)}
            ${this.sliderRow('Backing Track', 'backingVolume', settings.backingVolume)}
            ${this.sliderRow('Voice Samples', 'sampleVolume', settings.sampleVolume)}
          </fieldset>

          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
          ">
            <div>
              <div style="font-weight: 400; font-size: 14px; color: var(--tt-text);">Audio Calibration</div>
              <div style="font-size: 12px; color: var(--tt-text-muted); margin-top: 3px; font-weight: 300;">Audio offset: ${settings.latencyOffsetMs}ms</div>
            </div>
            <button class="btn btn-secondary calibrate-btn" style="font-size: 12px; padding: 8px 16px; border-radius: 16px;">Calibrate</button>
          </div>

          <div style="
            font-size: 10px;
            font-weight: 500;
            color: var(--tt-text-muted);
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 32px 0 20px;
          " aria-hidden="true">Gameplay</div>

          <fieldset style="border: none; padding: 0; margin: 0;">
            <legend class="sr-only" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);">Gameplay settings</legend>
            ${this.tempoRow(settings.tempo)}
            ${this.voiceRow(settings.voice)}
            ${this.toggleRow('Show Keyboard', 'showKeyboard', settings.showKeyboard, 'Visual keyboard during gameplay')}
            ${this.toggleRow('Timing Assist', 'timingAssist', settings.timingAssist, 'Wider timing windows for easier play')}
            ${this.toggleRow('Flow Mode', 'flowMode', settings.flowMode, 'Adaptive difficulty — tightens/relaxes timing with performance')}
            ${this.toggleRow('Phrase Mode', 'phraseMode', settings.phraseMode, 'Type full phrases instead of individual characters')}
          </fieldset>
        </div>
      </div>
    `;

    // Bind events
    this.container.querySelector('.back-btn')!.addEventListener('click', () => this.onBack());
    this.container.querySelector('.calibrate-btn')!.addEventListener('click', () => this.onCalibrate());

    // Sliders
    this.container.querySelectorAll('input[type="range"]').forEach((input) => {
      const el = input as HTMLInputElement;
      const label = el.parentElement?.querySelector('.slider-value') as HTMLElement | null;
      el.addEventListener('input', () => {
        this.onUpdate({ [el.dataset.setting!]: parseFloat(el.value) });
        if (label) label.textContent = `${Math.round(parseFloat(el.value) * 100)}%`;
      });
    });

    // Tempo slider (discrete steps)
    const tempoInput = this.container.querySelector('#setting-tempo') as HTMLInputElement | null;
    if (tempoInput) {
      const tempoLabel = tempoInput.parentElement?.querySelector('.slider-value') as HTMLElement | null;
      tempoInput.addEventListener('input', () => {
        const val = parseFloat(tempoInput.value);
        this.onUpdate({ tempo: val });
        if (tempoLabel) tempoLabel.textContent = `${Math.round(val * 100)}%`;
      });
    }

    // Voice picker buttons
    this.container.querySelectorAll('.voice-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const voice = (btn as HTMLElement).dataset.voice as Syllable;
        this.onUpdate({ voice });
        // Update active state
        this.container.querySelectorAll('.voice-option').forEach((b) => {
          const el = b as HTMLElement;
          if (el.dataset.voice === voice) {
            el.style.background = 'var(--tt-accent)';
            el.style.color = '#1a1418';
            el.style.borderColor = 'var(--tt-accent)';
          } else {
            el.style.background = 'rgba(255, 255, 255, 0.04)';
            el.style.color = 'var(--tt-text-muted)';
            el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }
        });
      });
    });

    // Checkboxes (toggles)
    this.container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      const el = input as HTMLInputElement;
      const toggle = el.nextElementSibling as HTMLElement;
      const knob = toggle.firstElementChild as HTMLElement;

      el.parentElement!.addEventListener('click', () => {
        el.checked = !el.checked;
        toggle.style.background = el.checked ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.06)';
        knob.style.left = el.checked ? '23px' : '3px';
        this.onUpdate({ [el.dataset.setting!]: el.checked });
      });
    });
  }

  private sliderRow(label: string, setting: string, value: number): string {
    const id = `setting-${setting}`;
    return `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: baseline;">
          <label for="${id}" style="font-weight: 400; font-size: 14px; color: var(--tt-text);">${label}</label>
          <span class="slider-value" style="
            color: var(--tt-text-muted);
            font-family: var(--tt-font-mono);
            font-size: 12px;
          " aria-hidden="true">${Math.round(value * 100)}%</span>
        </div>
        <input type="range" id="${id}" data-setting="${setting}" min="0" max="1" step="0.05" value="${value}"
          aria-label="${label}" aria-valuetext="${Math.round(value * 100)}%">
      </div>
    `;
  }

  private voiceRow(current: Syllable): string {
    const voices: { id: Syllable; label: string; desc: string }[] = [
      { id: 'dah', label: 'Ahh', desc: 'Warm, open' },
      { id: 'doh', label: 'Ohh', desc: 'Round, full' },
      { id: 'dmm', label: 'Hmm', desc: 'Soft hum' },
      { id: 'bmm', label: 'Bmm', desc: 'Punchy hit' },
      { id: 'don', label: 'Don', desc: 'Bright' },
      { id: 'doo', label: 'Ooh', desc: 'Smooth' },
      { id: 'nun', label: 'Nun', desc: 'Nasal' },
    ];

    const buttons = voices.map((v) => {
      const isActive = v.id === current;
      return `
        <button class="voice-option" data-voice="${v.id}" style="
          flex: 1;
          min-width: 54px;
          padding: 10px 4px 8px;
          border-radius: 10px;
          border: 1px solid ${isActive ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.08)'};
          background: ${isActive ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.04)'};
          color: ${isActive ? '#1a1418' : 'var(--tt-text-muted)'};
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          font-family: var(--tt-font-mono);
        ">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${v.label}</div>
          <div style="font-size: 9px; opacity: 0.7; font-weight: 400;">${v.desc}</div>
        </button>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 24px;">
        <div style="font-weight: 400; font-size: 14px; color: var(--tt-text); margin-bottom: 4px;">Voice</div>
        <div style="font-size: 12px; color: var(--tt-text-muted); margin-bottom: 12px; font-weight: 300;">Choose your vocal sound</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${buttons}
        </div>
      </div>
    `;
  }

  private tempoRow(value: number): string {
    const id = 'setting-tempo';
    return `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; align-items: baseline;">
          <label for="${id}" style="font-weight: 400; font-size: 14px; color: var(--tt-text);">Song Tempo</label>
          <span class="slider-value" style="
            color: var(--tt-text-muted);
            font-family: var(--tt-font-mono);
            font-size: 12px;
          " aria-hidden="true">${Math.round(value * 100)}%</span>
        </div>
        <div style="font-size: 12px; color: var(--tt-text-muted); margin-bottom: 10px; font-weight: 300;">Slow down songs while learning</div>
        <input type="range" id="${id}" min="0.5" max="1" step="0.25" value="${value}"
          aria-label="Song Tempo" aria-valuetext="${Math.round(value * 100)}%">
      </div>
    `;
  }

  private toggleRow(label: string, setting: string, checked: boolean, description: string): string {
    const id = `toggle-${setting}`;
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
      ">
        <div>
          <div id="${id}-label" style="font-weight: 400; font-size: 14px; color: var(--tt-text);">${label}</div>
          <div style="font-size: 12px; color: var(--tt-text-muted); margin-top: 3px; font-weight: 300;">${description}</div>
        </div>
        <label style="position: relative; width: 48px; height: 44px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;"
          aria-labelledby="${id}-label" role="switch" aria-checked="${checked}">
          <input type="checkbox" data-setting="${setting}" ${checked ? 'checked' : ''} style="display: none;" aria-label="${label}">
          <div class="toggle" style="
            width: 48px; height: 28px; border-radius: 14px;
            background: ${checked ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.06)'};
            transition: background 0.25s var(--tt-ease-out);
            position: relative;
          ">
            <div style="
              position: absolute; top: 3px; left: ${checked ? '23px' : '3px'};
              width: 22px; height: 22px; border-radius: 50%;
              background: white;
              transition: left 0.25s var(--tt-ease-out);
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            "></div>
          </div>
        </label>
      </div>
    `;
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
