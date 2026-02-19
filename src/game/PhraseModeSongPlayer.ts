/**
 * Phrase mode song player: player types entire phrases instead of individual notes.
 * Scoring based on accuracy, speed, and flow (no long pauses).
 */

import type { Beatmap, BeatmapNote, Grade, PhraseResult, SongResult, Syllable } from '../data/types';
import { AudioEngine } from '../audio/AudioEngine';
import { SampleBank } from '../audio/SampleBank';

export interface PhraseModeSongPlayerCallbacks {
  onCharCorrect: (charIndex: number, phraseIndex: number) => void;
  onCharWrong: (charIndex: number, phraseIndex: number) => void;
  onPhraseComplete: (result: PhraseResult) => void;
  onPhraseChange: (phraseIndex: number, phraseText: string, phraseDurationMs: number) => void;
  onSongComplete: (result: SongResult) => void;
  onTick?: (currentTimeMs: number) => void;
}

export interface PhraseModeSongPlayerOptions {
  voice?: Syllable;
  latencyOffsetMs?: number;
}

export class PhraseModeSongPlayer {
  private engine: AudioEngine;
  private sampleBank: SampleBank;
  private callbacks: PhraseModeSongPlayerCallbacks | null = null;
  private beatmap: Beatmap | null = null;

  private voice: Syllable;

  private phraseResults: PhraseResult[] = [];
  private currentPhraseIndex = 0;
  private cursorPos = 0; // Position within current phrase text
  private correctCount = 0;
  private wrongCount = 0;
  private lastCharTime = 0; // For flow/pause tracking
  private longPauses = 0;
  private phraseStartedAt = 0;
  private playing = false;
  private animFrameId = 0;

  constructor(engine: AudioEngine, sampleBank: SampleBank, options: PhraseModeSongPlayerOptions = {}) {
    this.engine = engine;
    this.sampleBank = sampleBank;
    this.voice = options.voice ?? 'dah';
  }

  async loadSong(beatmap: Beatmap, backingUrl: string): Promise<void> {
    this.beatmap = beatmap;
    this.phraseResults = [];
    this.currentPhraseIndex = 0;
    this.resetPhraseCursor();

    await this.engine.loadBacking(backingUrl);
    await this.sampleBank.loadSyllable(this.voice);
  }

  start(callbacks: PhraseModeSongPlayerCallbacks): void {
    this.callbacks = callbacks;
    this.playing = true;
    this.engine.playBacking();

    // Notify first phrase
    if (this.beatmap && this.beatmap.phrases.length > 0) {
      const phrase = this.beatmap.phrases[0];
      const duration = this.getPhraseDurationMs(0);
      this.callbacks.onPhraseChange(0, phrase.text, duration);
      this.phraseStartedAt = performance.now();
    }

    this.startTick();
  }

  private startTick(): void {
    const tick = () => {
      if (!this.playing) return;
      const t = this.engine.backingPositionMs;

      // Auto-advance phrase if time has passed
      this.checkPhraseTimeAdvance(t);

      this.callbacks?.onTick?.(t);
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  /** Check if current phrase time has expired and auto-complete it */
  private checkPhraseTimeAdvance(currentTimeMs: number): void {
    if (!this.beatmap) return;
    const phrases = this.beatmap.phrases;
    if (this.currentPhraseIndex >= phrases.length) return;

    const phraseEndTime = this.getPhraseEndTime(this.currentPhraseIndex);
    if (currentTimeMs >= phraseEndTime) {
      // Time's up — grade what they've done so far
      this.completePhraseByTimeout();
    }
  }

  handleKeystroke(key: string): void {
    if (!this.playing || !this.beatmap) return;
    if (this.currentPhraseIndex >= this.beatmap.phrases.length) return;

    const phrase = this.beatmap.phrases[this.currentPhraseIndex];
    const text = phrase.text;

    // Handle backspace
    if (key === 'backspace') {
      if (this.cursorPos > 0) {
        this.cursorPos--;
      }
      return;
    }

    if (this.cursorPos >= text.length) return;

    const now = performance.now();

    // Track long pauses (>2s between characters)
    if (this.lastCharTime > 0 && (now - this.lastCharTime) > 2000) {
      this.longPauses++;
    }
    this.lastCharTime = now;

    const expectedChar = text[this.cursorPos].toLowerCase();
    const isCorrect = key === expectedChar;

    if (isCorrect) {
      this.correctCount++;

      // Play voice sample using corresponding note's MIDI value
      const note = this.getNoteForCharIndex(this.cursorPos);
      if (note && expectedChar !== ' ') {
        this.sampleBank.playVoice(this.voice, note.midi);
      }

      this.callbacks?.onCharCorrect(this.cursorPos, this.currentPhraseIndex);
    } else {
      this.wrongCount++;
      this.callbacks?.onCharWrong(this.cursorPos, this.currentPhraseIndex);
    }

    this.cursorPos++;

    // Check if phrase is complete (all characters typed)
    if (this.cursorPos >= text.length) {
      this.completePhrase(true);
    }
  }

  /** Get the note corresponding to a character position in the current phrase */
  private getNoteForCharIndex(charIndex: number): BeatmapNote | null {
    if (!this.beatmap) return null;
    const phrase = this.beatmap.phrases[this.currentPhraseIndex];
    if (!phrase || !phrase.notes) return null;

    // Map character index to note index within the phrase
    // The phrase text chars correspond to notes in order
    if (charIndex < phrase.notes.length) {
      return phrase.notes[charIndex];
    }
    // Fallback to last note
    return phrase.notes[phrase.notes.length - 1] ?? null;
  }

  /** Complete phrase because player typed all chars */
  private completePhrase(finishedEarly: boolean): void {
    if (!this.beatmap) return;
    const phrase = this.beatmap.phrases[this.currentPhraseIndex];
    const totalChars = phrase.text.length;

    const accuracy = totalChars > 0 ? this.correctCount / totalChars : 0;
    const elapsed = performance.now() - this.phraseStartedAt;
    const durationMs = this.getPhraseDurationMs(this.currentPhraseIndex);
    const speedRatio = durationMs > 0 ? elapsed / durationMs : 1;

    const grade = this.gradePhrase(accuracy, finishedEarly, speedRatio);

    const result: PhraseResult = {
      phraseIndex: this.currentPhraseIndex,
      accuracy,
      speedRatio,
      grade,
      text: phrase.text,
    };

    this.phraseResults.push(result);
    this.callbacks?.onPhraseComplete(result);

    this.advanceToNextPhrase();
  }

  /** Complete phrase because time ran out */
  private completePhraseByTimeout(): void {
    if (!this.beatmap) return;
    const phrase = this.beatmap.phrases[this.currentPhraseIndex];
    const totalChars = phrase.text.length;
    const typedChars = this.cursorPos;

    const accuracy = totalChars > 0 ? this.correctCount / totalChars : 0;
    const abandoned = typedChars < totalChars * 0.5;

    let grade: Grade;
    if (abandoned || accuracy < 0.7) {
      grade = 'miss';
    } else if (accuracy >= 0.95) {
      grade = 'great';
    } else if (accuracy >= 0.85) {
      grade = 'good';
    } else {
      grade = 'miss';
    }

    const result: PhraseResult = {
      phraseIndex: this.currentPhraseIndex,
      accuracy,
      speedRatio: 1.0,
      grade,
      text: phrase.text,
    };

    this.phraseResults.push(result);
    this.callbacks?.onPhraseComplete(result);

    this.advanceToNextPhrase();
  }

  private advanceToNextPhrase(): void {
    if (!this.beatmap) return;

    this.currentPhraseIndex++;
    this.resetPhraseCursor();

    if (this.currentPhraseIndex >= this.beatmap.phrases.length) {
      this.complete();
      return;
    }

    const phrase = this.beatmap.phrases[this.currentPhraseIndex];
    const duration = this.getPhraseDurationMs(this.currentPhraseIndex);
    this.phraseStartedAt = performance.now();
    this.callbacks?.onPhraseChange(this.currentPhraseIndex, phrase.text, duration);
  }

  private resetPhraseCursor(): void {
    this.cursorPos = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.longPauses = 0;
    this.lastCharTime = 0;
  }

  private gradePhrase(accuracy: number, finishedEarly: boolean, speedRatio: number): Grade {
    if (accuracy >= 1.0 && finishedEarly) return 'perfect';
    if (accuracy >= 0.95 && speedRatio <= 1.0) return 'great';
    if (accuracy >= 0.85) return 'good';
    return 'miss';
  }

  private getPhraseDurationMs(phraseIndex: number): number {
    if (!this.beatmap) return 3000;
    const phrases = this.beatmap.phrases;
    const phrase = phrases[phraseIndex];
    if (!phrase) return 3000;

    if (phraseIndex < phrases.length - 1) {
      return phrases[phraseIndex + 1].startTime - phrase.startTime;
    }
    // Last phrase: use the last note's time + duration as estimate
    const lastNote = phrase.notes[phrase.notes.length - 1];
    if (lastNote) {
      return (lastNote.time + lastNote.duration) - phrase.startTime + 1000;
    }
    return 3000;
  }

  private getPhraseEndTime(phraseIndex: number): number {
    if (!this.beatmap) return Infinity;
    const phrases = this.beatmap.phrases;
    if (phraseIndex < phrases.length - 1) {
      return phrases[phraseIndex + 1].startTime;
    }
    // Last phrase
    const phrase = phrases[phraseIndex];
    const lastNote = phrase.notes[phrase.notes.length - 1];
    if (lastNote) {
      return lastNote.time + lastNote.duration + 1000;
    }
    return Infinity;
  }

  private complete(): void {
    this.playing = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.engine.stopBacking();

    if (this.beatmap && this.callbacks) {
      this.callbacks.onSongComplete(this.buildSongResult());
    }
  }

  private buildSongResult(): SongResult {
    const songId = this.beatmap?.songId ?? '';
    const counts = { perfects: 0, greats: 0, goods: 0, misses: 0 };

    for (const r of this.phraseResults) {
      if (r.grade === 'perfect') counts.perfects++;
      else if (r.grade === 'great') counts.greats++;
      else if (r.grade === 'good') counts.goods++;
      else counts.misses++;
    }

    const total = this.phraseResults.length;
    const accuracy = total > 0
      ? (counts.perfects * 300 + counts.greats * 250 + counts.goods * 200) / (total * 300)
      : 0;

    const score = counts.perfects * 300 + counts.greats * 250 + counts.goods * 200;

    let grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    if (accuracy >= 0.90) grade = 'S';
    else if (accuracy >= 0.75) grade = 'A';
    else if (accuracy >= 0.55) grade = 'B';
    else if (accuracy >= 0.40) grade = 'C';
    else if (accuracy >= 0.25) grade = 'D';
    else grade = 'F';

    return {
      songId,
      score,
      accuracy,
      maxCombo: 0,
      grade,
      noteResults: [],
      choirSize: 0,
      ...counts,
    };
  }

  stop(): void {
    this.playing = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;
    this.engine.stopBacking();
  }

  pause(): void {
    this.playing = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = 0;
    this.engine.pauseBacking();
  }

  resume(): void {
    if (this.playing) return;
    this.playing = true;
    this.engine.playBacking();
    this.startTick();
  }

  get isPlaying(): boolean { return this.playing; }
  get progress(): number {
    if (!this.beatmap) return 0;
    const total = this.beatmap.phrases.length;
    return total > 0 ? this.currentPhraseIndex / total : 0;
  }
}
