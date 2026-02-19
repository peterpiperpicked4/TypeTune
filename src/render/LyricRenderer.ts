/**
 * Lyric renderer: "The Conductor's Spotlight"
 *
 * A dramatic, theatrical timing display where characters warm up through
 * four visual stages as their moment approaches. The active character gets
 * a full radial spotlight that pulses with the BPM. Hit feedback produces
 * a satisfying burst before settling into grade colors.
 *
 * Five layers of drama:
 *   1. Approach wave — characters scale from 0.75x→1.35x and warm in color
 *   2. Spotlight disc — radial glow behind the active character, BPM-synced
 *   3. Ignition strips — 5px ember bars that glow upward as they fill
 *   4. Hit burst — theatrical flash + spotlight expansion on keystroke
 *   5. Grade afterglow — perfect=golden halo, miss=lights die
 */

import type { Beatmap, BeatmapNote, Grade } from '../data/types';

const PREVIEW_MS = 3000;

interface CharGroup {
  wrapper: HTMLElement;
  charEl: HTMLElement;
  spotlight: HTMLElement;
  ember: HTMLElement;
  emberFill: HTMLElement;
}

export class LyricRenderer {
  private container: HTMLElement;
  private currentPhraseEl: HTMLElement;
  private nextPhraseEl: HTMLElement;
  private beatmap: Beatmap | null = null;
  private currentPhraseIdx = 0;
  private noteGrades: Map<number, Grade> = new Map();
  private currentNoteInPhrase = 0;
  private charGroups: CharGroup[] = [];
  private phraseNotes: BeatmapNote[] = [];
  private activeIndex = -1;

  constructor(parent: HTMLElement) {
    this.injectStyles();

    this.container = document.createElement('div');
    this.container.className = 'lyrics lyric-display';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Lyrics');
    this.container.style.cssText = `
      position: relative;
      width: 100%;
      padding: clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      min-height: clamp(140px, 22vh, 240px);
      justify-content: center;
    `;

    // Current phrase container
    this.currentPhraseEl = document.createElement('div');
    this.currentPhraseEl.className = 'tt-current-phrase';
    this.currentPhraseEl.setAttribute('aria-live', 'polite');
    this.currentPhraseEl.setAttribute('aria-atomic', 'false');
    this.currentPhraseEl.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0;
      min-height: clamp(60px, 10vh, 90px);
      align-items: center;
      padding: 12px 0;
    `;

    // Next phrase preview
    this.nextPhraseEl = document.createElement('div');
    this.nextPhraseEl.className = 'tt-next-phrase';
    this.nextPhraseEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(13px, 2vw, 16px);
      font-weight: 400;
      color: rgba(240, 235, 227, 0.15);
      letter-spacing: clamp(1px, 0.3vw, 2px);
      text-align: center;
      padding: 16px 0 0;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      max-width: 100%;
      min-height: 24px;
    `;

    this.container.appendChild(this.currentPhraseEl);
    this.container.appendChild(this.nextPhraseEl);
    parent.appendChild(this.container);
  }

  private injectStyles(): void {
    if (document.getElementById('tt-lyric-styles')) return;
    const style = document.createElement('style');
    style.id = 'tt-lyric-styles';
    style.textContent = `
      @keyframes tt-spotlight-pulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.7;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.4);
          opacity: 1;
        }
      }

      @keyframes tt-char-active-pulse {
        0%, 100% {
          text-shadow:
            0 0 24px rgba(212,168,83,0.5),
            0 0 48px rgba(212,168,83,0.2),
            0 0 80px rgba(212,168,83,0.08);
        }
        50% {
          text-shadow:
            0 0 32px rgba(212,168,83,0.8),
            0 0 64px rgba(212,168,83,0.35),
            0 0 100px rgba(212,168,83,0.15);
        }
      }

      @keyframes tt-ember-active-pulse {
        0%, 100% {
          box-shadow:
            0 0 6px rgba(212,168,83,0.5),
            0 -4px 12px rgba(212,168,83,0.3),
            0 -8px 24px rgba(212,168,83,0.1);
        }
        50% {
          box-shadow:
            0 0 10px rgba(212,168,83,0.8),
            0 -6px 18px rgba(212,168,83,0.5),
            0 -12px 36px rgba(212,168,83,0.2);
        }
      }

      @keyframes tt-hit-burst {
        0% {
          color: #fff;
          text-shadow:
            0 0 40px rgba(255,255,255,0.9),
            0 0 80px rgba(212,168,83,0.6);
          transform: scale(1.6);
        }
        40% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes tt-spotlight-burst {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0.4;
        }
        100% {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }

      @keyframes tt-phrase-enter {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes tt-next-fade-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  setBeatmap(beatmap: Beatmap): void {
    this.beatmap = beatmap;
    this.currentPhraseIdx = 0;
    this.currentNoteInPhrase = 0;
    this.noteGrades.clear();
    this.activeIndex = -1;

    const beatDurationMs = 60000 / beatmap.bpm;
    this.container.style.setProperty('--tt-beat-duration', `${beatDurationMs}ms`);

    this.renderPhrase();
  }

  setPhrase(phraseIndex: number): void {
    if (this.currentPhraseIdx === phraseIndex) return;
    this.currentPhraseIdx = phraseIndex;
    this.currentNoteInPhrase = 0;
    this.noteGrades.clear();
    this.activeIndex = -1;
    this.renderPhrase();
  }

  markNote(noteIndexInPhrase: number, grade: Grade): void {
    this.noteGrades.set(noteIndexInPhrase, grade);
    this.currentNoteInPhrase = noteIndexInPhrase + 1;

    const group = this.charGroups[noteIndexInPhrase];
    if (!group) return;

    // Hit burst animation on character
    group.charEl.style.animation = 'tt-hit-burst 0.3s cubic-bezier(0.25, 0, 0.2, 1) forwards';

    // Spotlight burst outward and fade
    group.spotlight.style.animation = 'tt-spotlight-burst 0.4s cubic-bezier(0.25, 0, 0.2, 1) forwards';

    // After burst settles, apply grade styling
    setTimeout(() => {
      group.charEl.style.animation = '';
      group.spotlight.style.animation = '';
      group.spotlight.style.opacity = '0';
      this.applyGradeStyle(group, grade);
    }, 350);

    this.clearActiveState(noteIndexInPhrase);
  }

  getNoteIndexInPhrase(globalNoteIndex: number): number {
    if (!this.beatmap) return 0;
    let count = 0;
    for (let i = 0; i < this.currentPhraseIdx; i++) {
      count += this.beatmap.phrases[i].notes.length;
    }
    return globalNoteIndex - count;
  }

  /**
   * Update approach wave, ember fills, and active spotlight.
   * Called every animation frame during playback.
   */
  updateTimingBall(currentTimeMs: number): void {
    if (!this.beatmap || this.currentPhraseIdx >= this.beatmap.phrases.length) return;
    if (this.charGroups.length === 0 || this.phraseNotes.length === 0) return;

    let newActiveIndex = -1;

    for (let i = 0; i < this.charGroups.length; i++) {
      const note = this.phraseNotes[i];
      const group = this.charGroups[i];
      const grade = this.noteGrades.get(i);

      if (grade) continue;

      const timeUntil = note.time - currentTimeMs;
      const fillProgress = Math.max(0, Math.min(1, 1 - (timeUntil / PREVIEW_MS)));

      // ── Ember fill ──
      group.emberFill.style.transform = `scaleX(${fillProgress})`;

      // Ember color + glow intensifies through stages
      if (fillProgress > 0.9) {
        group.emberFill.style.background = 'linear-gradient(90deg, #d4a853, #e8c36a)';
        group.emberFill.style.boxShadow = '0 -6px 16px rgba(212,168,83,0.5), 0 -12px 32px rgba(212,168,83,0.2), 0 0 8px rgba(212,168,83,0.6)';
      } else if (fillProgress > 0.7) {
        group.emberFill.style.background = 'linear-gradient(90deg, rgba(212,168,83,0.5), rgba(212,168,83,0.9))';
        group.emberFill.style.boxShadow = '0 -4px 12px rgba(212,168,83,0.3), 0 -8px 24px rgba(212,168,83,0.1)';
      } else if (fillProgress > 0.4) {
        group.emberFill.style.background = 'linear-gradient(90deg, rgba(180,160,130,0.3), rgba(212,168,83,0.6))';
        group.emberFill.style.boxShadow = 'none';
      } else if (fillProgress > 0) {
        group.emberFill.style.background = 'linear-gradient(90deg, rgba(140,140,150,0.15), rgba(180,165,140,0.35))';
        group.emberFill.style.boxShadow = 'none';
      }

      // ── Character approach wave (scale + color warmth) ──
      if (i === this.currentNoteInPhrase) {
        newActiveIndex = i;
      } else if (timeUntil < 300) {
        // Hot — almost active
        group.charEl.style.color = 'rgba(240, 235, 227, 0.7)';
        group.charEl.style.transform = 'scale(1.0)';
        group.charEl.style.textShadow = '0 0 8px rgba(212,168,83,0.15)';
      } else if (timeUntil < 1500) {
        // Warming
        const warmth = 1 - (timeUntil - 300) / 1200;
        const opacity = 0.3 + warmth * 0.3;
        const scale = 0.85 + warmth * 0.12;
        group.charEl.style.color = `rgba(230, 215, 185, ${opacity})`;
        group.charEl.style.transform = `scale(${scale})`;
        group.charEl.style.textShadow = 'none';
      } else if (timeUntil < 2500) {
        // Cold — barely visible
        const visibility = 1 - (timeUntil - 1500) / 1000;
        const opacity = 0.12 + visibility * 0.15;
        const scale = 0.75 + visibility * 0.1;
        group.charEl.style.color = `rgba(200, 195, 190, ${opacity})`;
        group.charEl.style.transform = `scale(${scale})`;
        group.charEl.style.textShadow = 'none';
      } else {
        // Dark — waiting
        group.charEl.style.color = 'rgba(200, 195, 190, 0.1)';
        group.charEl.style.transform = 'scale(0.75)';
        group.charEl.style.textShadow = 'none';
      }
    }

    // ── Update active character spotlight ──
    if (newActiveIndex !== this.activeIndex) {
      if (this.activeIndex >= 0 && this.activeIndex < this.charGroups.length) {
        this.clearActiveState(this.activeIndex);
      }
      if (newActiveIndex >= 0) {
        this.setActiveState(newActiveIndex);
      }
      this.activeIndex = newActiveIndex;
    }
  }

  private setActiveState(index: number): void {
    const group = this.charGroups[index];
    if (!group || this.noteGrades.has(index)) return;

    const beatDur = this.container.style.getPropertyValue('--tt-beat-duration') || '833ms';

    // Character — large, bright, pulsing
    group.charEl.style.color = '#f0ebe3';
    group.charEl.style.transform = 'scale(1.35)';
    group.charEl.style.animation = `tt-char-active-pulse ${beatDur} ease-in-out infinite`;
    group.charEl.style.zIndex = '3';

    // Spotlight disc — visible and pulsing
    group.spotlight.style.opacity = '1';
    group.spotlight.style.animation = `tt-spotlight-pulse ${beatDur} ease-in-out infinite`;

    // Ember — blazing and pulsing
    group.emberFill.style.background = 'linear-gradient(90deg, #d4a853, #f0d080)';
    group.emberFill.style.animation = `tt-ember-active-pulse ${beatDur} ease-in-out infinite`;
    group.emberFill.style.transform = 'scaleX(1)';
  }

  private clearActiveState(index: number): void {
    const group = this.charGroups[index];
    if (!group) return;

    group.charEl.style.transform = 'scale(1)';
    group.charEl.style.animation = '';
    group.charEl.style.zIndex = '';
    group.charEl.style.textShadow = 'none';

    group.spotlight.style.opacity = '0';
    group.spotlight.style.animation = '';

    group.emberFill.style.animation = '';
    group.emberFill.style.boxShadow = 'none';
  }

  private applyGradeStyle(group: CharGroup, grade: Grade): void {
    group.charEl.style.color = this.gradeColor(grade);
    group.charEl.style.transform = 'scale(1)';

    if (grade === 'perfect') {
      group.charEl.style.textShadow = '0 0 16px rgba(212,168,83,0.6), 0 0 32px rgba(212,168,83,0.2)';
      group.charEl.style.opacity = '1';
      group.emberFill.style.background = 'linear-gradient(90deg, #d4a853, #e8c36a)';
      group.emberFill.style.transform = 'scaleX(1)';
      group.emberFill.style.boxShadow = '0 0 8px rgba(212,168,83,0.4)';
      group.ember.style.height = '5px';
    } else if (grade === 'great') {
      group.charEl.style.textShadow = '0 0 10px rgba(240,235,227,0.2)';
      group.charEl.style.opacity = '1';
      group.emberFill.style.background = 'rgba(240,235,227,0.5)';
      group.emberFill.style.transform = 'scaleX(1)';
      group.emberFill.style.boxShadow = 'none';
    } else if (grade === 'good') {
      group.charEl.style.textShadow = 'none';
      group.charEl.style.opacity = '0.65';
      group.emberFill.style.background = 'rgba(200,190,175,0.3)';
      group.emberFill.style.transform = 'scaleX(0.7)';
      group.emberFill.style.boxShadow = 'none';
    } else if (grade === 'miss') {
      group.charEl.style.textShadow = 'none';
      group.charEl.style.opacity = '0.3';
      group.charEl.style.transition = 'opacity 0.6s ease';
      group.emberFill.style.background = 'var(--tt-miss, #e74c3c)';
      group.emberFill.style.transform = 'scaleX(1)';
      group.emberFill.style.boxShadow = 'none';
      group.emberFill.style.opacity = '0.25';
    }
  }

  private renderPhrase(): void {
    if (!this.beatmap || this.currentPhraseIdx >= this.beatmap.phrases.length) return;

    const phrase = this.beatmap.phrases[this.currentPhraseIdx];
    this.phraseNotes = phrase.notes;

    this.currentPhraseEl.innerHTML = '';
    this.charGroups = [];

    // Animate entry
    this.currentPhraseEl.style.animation = 'tt-phrase-enter 0.5s cubic-bezier(0.25, 0, 0.2, 1) forwards';
    setTimeout(() => { this.currentPhraseEl.style.animation = ''; }, 500);

    for (let i = 0; i < phrase.notes.length; i++) {
      const note = phrase.notes[i];
      const group = this.createCharGroup(note.char);
      this.charGroups.push(group);
      this.currentPhraseEl.appendChild(group.wrapper);
    }

    // Next phrase preview
    const nextPhrase = this.beatmap.phrases[this.currentPhraseIdx + 1];
    if (nextPhrase) {
      this.nextPhraseEl.textContent = nextPhrase.text;
      this.nextPhraseEl.style.animation = 'tt-next-fade-in 0.6s cubic-bezier(0.25, 0, 0.2, 1) forwards';
      setTimeout(() => { this.nextPhraseEl.style.animation = ''; }, 600);
    } else {
      this.nextPhraseEl.textContent = '';
    }
  }

  private createCharGroup(char: string): CharGroup {
    const wrapper = document.createElement('span');
    wrapper.style.cssText = `
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 0 2px;
      position: relative;
      margin: 6px 0;
    `;

    // Spotlight disc — hidden by default, shown for active char
    const spotlight = document.createElement('span');
    spotlight.style.cssText = `
      position: absolute;
      top: 45%;
      left: 50%;
      width: 68px;
      height: 68px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(212, 168, 83, 0.3) 0%,
        rgba(212, 168, 83, 0.1) 40%,
        rgba(212, 168, 83, 0.03) 65%,
        transparent 75%
      );
      pointer-events: none;
      z-index: 0;
      opacity: 0;
      will-change: transform, opacity;
    `;

    const charEl = document.createElement('span');
    charEl.textContent = char;
    charEl.style.cssText = `
      font-family: var(--tt-font-mono);
      font-size: clamp(24px, 5vw, 38px);
      font-weight: 600;
      line-height: 1.3;
      display: block;
      position: relative;
      will-change: transform, color;
      color: rgba(200, 195, 190, 0.1);
      white-space: pre;
      z-index: 1;
      transform: scale(0.75);
      transition: transform 0.25s cubic-bezier(0.25, 0, 0.2, 1),
                  color 0.3s ease;
    `;

    const ember = document.createElement('span');
    ember.style.cssText = `
      display: block;
      width: 100%;
      height: 5px;
      background: rgba(212, 168, 83, 0.08);
      border-radius: 3px;
      overflow: visible;
      margin-top: 8px;
      min-width: 16px;
      position: relative;
      z-index: 1;
    `;

    const emberFill = document.createElement('span');
    emberFill.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 3px;
      transform: scaleX(0);
      transform-origin: left;
      will-change: transform, box-shadow;
      background: linear-gradient(90deg, rgba(140,140,150,0.15), rgba(180,165,140,0.35));
    `;

    ember.appendChild(emberFill);
    wrapper.appendChild(spotlight);
    wrapper.appendChild(charEl);
    wrapper.appendChild(ember);

    return { wrapper, charEl, spotlight, ember, emberFill };
  }

  private gradeColor(grade: Grade): string {
    switch (grade) {
      case 'perfect': return 'var(--tt-perfect, #d4a853)';
      case 'great': return 'var(--tt-great, #f0ebe3)';
      case 'good': return 'var(--tt-good, #888)';
      case 'miss': return 'var(--tt-miss, #e74c3c)';
    }
  }

  get element(): HTMLElement {
    return this.container;
  }
}
