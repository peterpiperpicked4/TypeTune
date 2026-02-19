/**
 * Song selection: semantic list, keyboard-navigable cards, CSS-class hover.
 * Includes compact voice picker strip above song list.
 */

import type { SongMeta, Syllable } from '../data/types';
import { songs } from '../data/songs';
import { PlayerProgress } from '../progression/PlayerProgress';
import { isSongUnlocked } from '../progression/Unlocks';

export class SongSelect {
  private container: HTMLElement;
  private onSelect: (song: SongMeta) => void;
  private onBack: () => void;
  private progress: PlayerProgress;

  constructor(parent: HTMLElement, progress: PlayerProgress, onSelect: (song: SongMeta) => void, onBack: () => void) {
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.progress = progress;

    this.container = document.createElement('div');
    this.container.className = 'screen song-select-screen hidden';
    this.container.style.cssText = `
      padding: clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px);
      overflow-y: auto;
    `;

    parent.appendChild(this.container);
  }

  show(): void {
    this.render();
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }

  private render(): void {
    const level = this.progress.level;
    const currentVoice = this.progress.settings.voice;

    this.container.innerHTML = `
      <div style="
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212, 168, 83, 0.04) 0%, transparent 70%);
      " aria-hidden="true"></div>
      <div style="max-width: 560px; width: 100%; margin: 0 auto; position: relative; z-index: 1;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: clamp(16px, 3vw, 24px);">
          <button class="btn btn-secondary back-btn" style="font-size: 13px; padding: 8px 18px; border-radius: 20px;">Back</button>
          <h2 style="
            font-family: var(--tt-font-display);
            font-size: clamp(24px, 4vw, 32px);
            font-weight: 300;
            font-style: italic;
            color: var(--tt-text);
          ">Choose a Song</h2>
          <div style="
            font-size: 11px;
            font-weight: 500;
            color: var(--tt-accent);
            letter-spacing: 2px;
            text-transform: uppercase;
          " aria-label="Player level ${level}">Lvl ${level}</div>
        </div>

        <div class="voice-picker-strip" style="
          display: flex;
          gap: 4px;
          margin-bottom: clamp(16px, 3vw, 24px);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 2px 0;
        " role="radiogroup" aria-label="Voice selection">
          ${this.renderVoiceButtons(currentVoice)}
        </div>

        <ul class="song-cards" style="display: flex; flex-direction: column; gap: 8px; list-style: none;" role="list" aria-label="Available songs"></ul>
      </div>
    `;

    this.container.querySelector('.back-btn')!.addEventListener('click', () => this.onBack());

    // Voice picker event handling
    this.container.querySelectorAll('.voice-strip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const voice = (btn as HTMLElement).dataset.voice as Syllable;
        this.progress.updateSettings({ voice });
        // Update active state
        this.container.querySelectorAll('.voice-strip-btn').forEach((b) => {
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

    const cardsContainer = this.container.querySelector('.song-cards')!;

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const unlocked = isSongUnlocked(song, level);
      const highScore = this.progress.getHighScore(song.id);
      const bestGrade = this.progress.getBestGrade(song.id);

      const li = document.createElement('li');

      const card = document.createElement('div');
      card.className = unlocked ? 'song-card' : '';
      card.setAttribute('role', unlocked ? 'button' : 'listitem');
      if (unlocked) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${song.title}, difficulty ${song.difficulty} of 5, ${song.bpm} BPM${bestGrade ? `, best grade ${bestGrade}` : ''}`);
      } else {
        card.setAttribute('aria-label', `${song.title}, locked, unlocks at level ${song.unlockLevel}`);
        card.setAttribute('aria-disabled', 'true');
      }
      card.style.cssText = `
        display: flex;
        align-items: center;
        gap: clamp(10px, 2vw, 16px);
        padding: clamp(14px, 2vw, 18px) clamp(14px, 2vw, 22px);
        background: ${unlocked ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.01)'};
        border-radius: 12px;
        border: 1px solid ${unlocked ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)'};
        cursor: ${unlocked ? 'pointer' : 'default'};
        animation: slideUp 0.4s var(--tt-ease-out-expo) forwards;
        animation-delay: ${i * 0.06}s;
        opacity: 0;
        --final-opacity: ${unlocked ? '1' : '0.45'};
        outline: none;
      `;

      if (unlocked) {
        const selectSong = () => {
          // Update voice picker to song's default voice on select (visual only — doesn't save unless user clicks)
          this.onSelect(song);
        };
        card.addEventListener('click', selectSong);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSong();
          }
        });

        // On focus/hover, show song's default voice in the picker (visual hint only)
        const hintVoice = () => {
          this.highlightVoiceHint(song.syllable);
        };
        card.addEventListener('mouseenter', hintVoice);
        card.addEventListener('focus', hintVoice);

        const restoreVoice = () => {
          this.highlightVoiceHint(this.progress.settings.voice);
        };
        card.addEventListener('mouseleave', restoreVoice);
        card.addEventListener('blur', restoreVoice);
      }

      // Accent bar
      const bar = document.createElement('div');
      bar.setAttribute('aria-hidden', 'true');
      bar.style.cssText = `
        width: 3px;
        height: 36px;
        border-radius: 2px;
        background: ${unlocked ? song.coverColor : '#333'};
        flex-shrink: 0;
        opacity: ${unlocked ? '0.8' : '0.3'};
      `;

      // Song info
      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0;';

      const title = document.createElement('div');
      title.style.cssText = `
        font-family: var(--tt-font-display);
        font-weight: 400;
        font-size: clamp(17px, 2.5vw, 20px);
        color: var(--tt-text);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      title.textContent = song.title;

      const meta = document.createElement('div');
      meta.setAttribute('aria-hidden', 'true');
      meta.style.cssText = `
        font-size: clamp(11px, 1.5vw, 12px);
        color: var(--tt-text-muted);
        margin-top: 4px;
        font-weight: 400;
        letter-spacing: 0.5px;
      `;

      // Difficulty: filled/unfilled dots (distinguishable without color by count)
      const diffDots = Array.from({ length: 5 }, (_, j) =>
        `<span style="color: ${j < song.difficulty ? 'var(--tt-accent)' : 'var(--tt-text-muted)'}; opacity: ${j < song.difficulty ? '1' : '0.3'};">${j < song.difficulty ? '\u25CF' : '\u25CB'}</span>`
      ).join(' ');

      meta.innerHTML = `
        ${diffDots}
        <span style="margin-left: 10px; opacity: 0.6;">${song.bpm} BPM</span>
        ${!unlocked ? `<span style="margin-left: 10px; color: var(--tt-text-muted);">Unlocks at level ${song.unlockLevel}</span>` : ''}
      `;

      info.appendChild(title);
      info.appendChild(meta);

      // Score/grade
      const scoreEl = document.createElement('div');
      scoreEl.style.cssText = 'text-align: right; flex-shrink: 0;';
      if (bestGrade) {
        const gradeEl = document.createElement('div');
        gradeEl.style.cssText = `
          font-family: var(--tt-font-display);
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 600;
          font-style: italic;
          color: ${bestGrade === 'S' ? 'var(--tt-gold)' : 'var(--tt-text)'};
          line-height: 1;
          ${bestGrade === 'S' ? 'text-shadow: 0 0 20px rgba(212, 168, 83, 0.4);' : ''}
        `;
        gradeEl.textContent = bestGrade;
        gradeEl.setAttribute('aria-label', `Grade ${bestGrade}`);

        const scoreText = document.createElement('div');
        scoreText.style.cssText = 'font-size: 11px; color: var(--tt-text-muted); margin-top: 2px; letter-spacing: 0.5px;';
        scoreText.textContent = highScore.toLocaleString();

        scoreEl.appendChild(gradeEl);
        scoreEl.appendChild(scoreText);
      } else if (!unlocked) {
        const lockEl = document.createElement('div');
        lockEl.setAttribute('aria-hidden', 'true');
        lockEl.style.cssText = 'font-size: 16px; color: var(--tt-text-muted); opacity: 0.4;';
        lockEl.textContent = '\u2022\u2022\u2022';
        scoreEl.appendChild(lockEl);
      }

      card.appendChild(bar);
      card.appendChild(info);
      card.appendChild(scoreEl);
      li.appendChild(card);
      cardsContainer.appendChild(li);
    }
  }

  private renderVoiceButtons(current: Syllable): string {
    const voices: { id: Syllable; label: string }[] = [
      { id: 'dah', label: 'Ahh' },
      { id: 'doh', label: 'Ohh' },
      { id: 'dmm', label: 'Hmm' },
      { id: 'bmm', label: 'Bmm' },
      { id: 'don', label: 'Don' },
      { id: 'doo', label: 'Ooh' },
      { id: 'nun', label: 'Nun' },
    ];

    return voices.map((v) => {
      const isActive = v.id === current;
      return `
        <button class="voice-strip-btn" data-voice="${v.id}" role="radio" aria-checked="${isActive}" aria-label="Voice: ${v.label}" style="
          min-width: 44px;
          min-height: 44px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid ${isActive ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.08)'};
          background: ${isActive ? 'var(--tt-accent)' : 'rgba(255, 255, 255, 0.04)'};
          color: ${isActive ? '#1a1418' : 'var(--tt-text-muted)'};
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          font-family: var(--tt-font-mono);
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        ">${v.label}</button>
      `;
    }).join('');
  }

  /** Temporarily highlight a voice button (for song hover hints) without saving */
  private highlightVoiceHint(voice: Syllable): void {
    this.container.querySelectorAll('.voice-strip-btn').forEach((b) => {
      const el = b as HTMLElement;
      const isHint = el.dataset.voice === voice;
      const isSaved = el.dataset.voice === this.progress.settings.voice;
      if (isHint) {
        el.style.borderColor = 'var(--tt-accent)';
        el.style.background = isSaved ? 'var(--tt-accent)' : 'rgba(212, 168, 83, 0.15)';
        el.style.color = isSaved ? '#1a1418' : 'var(--tt-accent)';
      } else if (isSaved) {
        el.style.background = 'var(--tt-accent)';
        el.style.color = '#1a1418';
        el.style.borderColor = 'var(--tt-accent)';
      } else {
        el.style.background = 'rgba(255, 255, 255, 0.04)';
        el.style.color = 'var(--tt-text-muted)';
        el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    });
  }

  get element(): HTMLElement { return this.container; }
}
