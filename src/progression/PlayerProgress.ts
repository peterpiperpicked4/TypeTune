/**
 * Player progress: localStorage persistence for level, scores, practice stats, settings.
 */

import type { LetterGrade, PlayerData, PlayerSettings, PracticeResult, PracticeSessionStats } from '../data/types';

const STORAGE_KEY = 'hollens_typing_choir';

const DEFAULT_SETTINGS: PlayerSettings = {
  masterVolume: 0.8,
  backingVolume: 0.6,
  sampleVolume: 1.0,
  showKeyboard: true,
  timingAssist: false,
  tempo: 1.0,
  voice: 'doo',
  latencyOffsetMs: 0,
  flowMode: true,
  phraseMode: false,
};

const DEFAULT_DATA: PlayerData = {
  level: 1,
  songCompletions: {},
  practiceStats: {},
  settings: { ...DEFAULT_SETTINGS },
};

const DEFAULT_PRACTICE_STATS: PracticeSessionStats = {
  bestWpm: 0,
  bestAccuracy: 0,
  totalSessions: 0,
  totalCharsTyped: 0,
  perKeyLifetime: {},
};

export class PlayerProgress {
  private data: PlayerData;

  constructor() {
    this.data = this.load();
  }

  private load(): PlayerData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlayerData;
        return {
          ...DEFAULT_DATA,
          ...parsed,
          practiceStats: parsed.practiceStats ?? {},
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        };
      }
    } catch {
      // Corrupted data, reset
    }
    return { ...DEFAULT_DATA, settings: { ...DEFAULT_SETTINGS } };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable
    }
  }

  get level(): number { return this.data.level; }
  get settings(): PlayerSettings { return this.data.settings; }

  // ── Song Mode ──

  recordCompletion(songId: string, score: number, grade: LetterGrade): void {
    const existing = this.data.songCompletions[songId];
    const gradeRank: Record<LetterGrade, number> = { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };

    if (!existing) {
      this.data.songCompletions[songId] = { highScore: score, bestGrade: grade };
    } else {
      if (score > existing.highScore) existing.highScore = score;
      if (gradeRank[grade] > gradeRank[existing.bestGrade]) existing.bestGrade = grade;
    }

    // Level = number of unique songs completed with C or better (never decreases)
    const passingGrades = new Set<LetterGrade>(['S', 'A', 'B', 'C']);
    let passCount = 0;
    for (const completion of Object.values(this.data.songCompletions)) {
      if (passingGrades.has(completion.bestGrade)) passCount++;
    }
    this.data.level = Math.max(this.data.level, passCount + 1);

    this.save();
  }

  getHighScore(songId: string): number {
    return this.data.songCompletions[songId]?.highScore ?? 0;
  }

  getBestGrade(songId: string): LetterGrade | null {
    return this.data.songCompletions[songId]?.bestGrade ?? null;
  }

  // ── Practice Mode ──

  recordPracticeSession(result: PracticeResult): void {
    const lessonId = result.lessonId;
    const existing = this.data.practiceStats[lessonId] ?? { ...DEFAULT_PRACTICE_STATS, perKeyLifetime: {} };

    existing.totalSessions++;
    existing.totalCharsTyped += result.totalChars;
    if (result.wpm > existing.bestWpm) existing.bestWpm = result.wpm;
    if (result.accuracy > existing.bestAccuracy) existing.bestAccuracy = result.accuracy;

    // Merge per-key stats
    for (const [key, stats] of Object.entries(result.perKeyStats)) {
      if (!existing.perKeyLifetime[key]) {
        existing.perKeyLifetime[key] = { hits: 0, misses: 0 };
      }
      existing.perKeyLifetime[key].hits += stats.hits;
      existing.perKeyLifetime[key].misses += stats.misses;
    }

    this.data.practiceStats[lessonId] = existing;
    this.save();
  }

  getPracticeStats(lessonId: string): PracticeSessionStats | null {
    return this.data.practiceStats[lessonId] ?? null;
  }

  /** Get lifetime per-key accuracy across all lessons. */
  getLifetimeKeyStats(): Record<string, { hits: number; misses: number; accuracy: number }> {
    const merged: Record<string, { hits: number; misses: number }> = {};

    for (const stats of Object.values(this.data.practiceStats)) {
      for (const [key, kstat] of Object.entries(stats.perKeyLifetime)) {
        if (!merged[key]) merged[key] = { hits: 0, misses: 0 };
        merged[key].hits += kstat.hits;
        merged[key].misses += kstat.misses;
      }
    }

    const result: Record<string, { hits: number; misses: number; accuracy: number }> = {};
    for (const [key, stat] of Object.entries(merged)) {
      const total = stat.hits + stat.misses;
      result[key] = { ...stat, accuracy: total > 0 ? stat.hits / total : 1 };
    }
    return result;
  }

  // ── Settings ──

  updateSettings(settings: Partial<PlayerSettings>): void {
    Object.assign(this.data.settings, settings);
    this.save();
  }

  reset(): void {
    this.data = { ...DEFAULT_DATA, settings: { ...DEFAULT_SETTINGS } };
    this.save();
  }
}
