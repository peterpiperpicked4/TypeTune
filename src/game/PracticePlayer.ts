/**
 * PracticePlayer: drives Practice Mode gameplay.
 *
 * Unlike SongPlayer (beatmap-driven), PracticePlayer:
 *   - Draws words from a lesson's word pool, biased by AdaptiveEngine
 *   - No timing judgement — accuracy and WPM only
 *   - Tracks per-key hit/miss stats for adaptive feedback
 *   - Optional backing MP3 plays for ambience (no sync)
 *   - Runs for a fixed duration (60s default) or word count
 */

import type { Lesson, PracticeResult, LessonId } from '../data/types';
import { AudioEngine } from '../audio/AudioEngine';
import { AdaptiveEngine } from './AdaptiveEngine';

export interface PracticeCallbacks {
  onCorrectKey: (key: string, charIndex: number, wordIndex: number) => void;
  onWrongKey: (pressedKey: string, expectedKey: string, charIndex: number, wordIndex: number) => void;
  onWordComplete: (wordIndex: number, wordText: string) => void;
  onNewWord: (wordIndex: number, wordText: string) => void;
  onComplete: (result: PracticeResult) => void;
}

export class PracticePlayer {
  private engine: AudioEngine;
  private adaptive: AdaptiveEngine;
  private lesson: Lesson | null = null;
  private callbacks: PracticeCallbacks | null = null;

  private words: string[] = [];
  private currentWordIndex = 0;
  private currentCharIndex = 0;
  private playing = false;

  // Stats
  private correctChars = 0;
  private incorrectChars = 0;
  private perKeyStats: Record<string, { hits: number; misses: number }> = {};
  private startTime = 0;
  private durationMs: number;
  private timerId = 0;

  constructor(engine: AudioEngine, durationMs: number = 60_000) {
    this.engine = engine;
    this.adaptive = new AdaptiveEngine();
    this.durationMs = durationMs;
  }

  /** Generate words using the adaptive engine for smart selection. */
  private generateWords(lesson: Lesson, count: number): string[] {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.adaptive.pickWord(lesson.wordPool));
    }
    return result;
  }

  async loadLesson(lesson: Lesson): Promise<void> {
    this.lesson = lesson;
    this.adaptive.reset();
    this.words = this.generateWords(lesson, 100);
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.perKeyStats = {};

    // Load optional backing track
    if (lesson.backingTrackUrl) {
      await this.engine.loadBacking(lesson.backingTrackUrl);
    }
  }

  start(callbacks: PracticeCallbacks): void {
    if (!this.lesson) return;
    this.callbacks = callbacks;
    this.playing = true;
    this.startTime = performance.now();

    // Start timer
    this.timerId = window.setTimeout(() => {
      this.complete();
    }, this.durationMs);

    // Start optional backing track
    if (this.lesson.backingTrackUrl) {
      this.engine.playBacking();
    }

    // Notify UI of first word
    this.callbacks.onNewWord(0, this.words[0]);
  }

  handleKeystroke(key: string): void {
    if (!this.playing || !this.lesson) return;

    const currentWord = this.words[this.currentWordIndex];
    if (!currentWord) return;

    const expectedChar = currentWord[this.currentCharIndex];

    if (key === expectedChar) {
      // Correct
      this.correctChars++;
      this.recordKeyStat(expectedChar, true);
      this.adaptive.record(expectedChar, true);
      this.callbacks?.onCorrectKey(key, this.currentCharIndex, this.currentWordIndex);
      this.currentCharIndex++;

      // Word complete?
      if (this.currentCharIndex >= currentWord.length) {
        this.callbacks?.onWordComplete(this.currentWordIndex, currentWord);
        this.currentWordIndex++;
        this.currentCharIndex = 0;

        // Generate more words if running low (adaptive picks)
        if (this.currentWordIndex >= this.words.length - 5) {
          this.words.push(...this.generateWords(this.lesson, 20));
        }

        if (this.playing) {
          this.callbacks?.onNewWord(this.currentWordIndex, this.words[this.currentWordIndex]);
        }
      }
    } else {
      // Wrong key
      this.incorrectChars++;
      this.recordKeyStat(expectedChar, false);
      this.adaptive.record(expectedChar, false);
      this.callbacks?.onWrongKey(key, expectedChar, this.currentCharIndex, this.currentWordIndex);
    }
  }

  private recordKeyStat(key: string, hit: boolean): void {
    if (!this.perKeyStats[key]) {
      this.perKeyStats[key] = { hits: 0, misses: 0 };
    }
    if (hit) {
      this.perKeyStats[key].hits++;
    } else {
      this.perKeyStats[key].misses++;
    }
  }

  private complete(): void {
    this.playing = false;
    window.clearTimeout(this.timerId);

    if (this.lesson?.backingTrackUrl) {
      this.engine.stopBacking();
    }

    const elapsed = performance.now() - this.startTime;
    const totalChars = this.correctChars + this.incorrectChars;
    const minutes = elapsed / 60_000;
    const wpm = minutes > 0 ? Math.round((this.correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? this.correctChars / totalChars : 0;

    const result: PracticeResult = {
      lessonId: this.lesson!.id as LessonId,
      wordsCompleted: this.currentWordIndex,
      totalChars,
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      wpm,
      accuracy,
      perKeyStats: { ...this.perKeyStats },
      durationMs: elapsed,
    };

    this.callbacks?.onComplete(result);
  }

  stop(): void {
    this.playing = false;
    window.clearTimeout(this.timerId);
    if (this.lesson?.backingTrackUrl) {
      this.engine.stopBacking();
    }
  }

  get isPlaying(): boolean { return this.playing; }
  get currentWord(): string | null {
    return this.currentWordIndex < this.words.length ? this.words[this.currentWordIndex] : null;
  }
  get charIndex(): number { return this.currentCharIndex; }
  get wordIndex(): number { return this.currentWordIndex; }
  get progress(): number {
    const elapsed = performance.now() - this.startTime;
    return Math.min(1, elapsed / this.durationMs);
  }
  get timeRemainingMs(): number {
    const elapsed = performance.now() - this.startTime;
    return Math.max(0, this.durationMs - elapsed);
  }
  getUpcomingWords(count: number): string[] {
    return this.words.slice(this.currentWordIndex + 1, this.currentWordIndex + 1 + count);
  }
}
