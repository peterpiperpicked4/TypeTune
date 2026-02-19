/**
 * Scoring system: points, combos, accuracy, grade assignment.
 */

import type { Grade, LetterGrade, NoteResult, SongResult } from '../data/types';
import gameConfig from '../../configs/game.json';

const { perfect, great, good } = gameConfig.scoring;
const { comboThresholds, comboMultipliers } = gameConfig.scoring;

export class ScoreSystem {
  private results: NoteResult[] = [];
  private _score = 0;
  private _combo = 0;
  private _maxCombo = 0;
  private _choirSize = 0;
  private readonly choirThresholds = [5, 10, 15, 20, 30, 40, 50, 75];

  get score(): number { return this._score; }
  get combo(): number { return this._combo; }
  get maxCombo(): number { return this._maxCombo; }
  get choirSize(): number { return this._choirSize; }

  private getMultiplier(): number {
    for (let i = comboThresholds.length - 1; i >= 0; i--) {
      if (this._combo >= comboThresholds[i]) return comboMultipliers[i + 1];
    }
    return comboMultipliers[0];
  }

  recordHit(grade: Grade, timingOffset: number, dynamic: number): NoteResult {
    const basePoints = grade === 'perfect' ? perfect : grade === 'great' ? great : grade === 'good' ? good : 0;

    if (grade === 'miss') {
      this._combo = 0;
      // Remove choir members on combo break (most recent first)
      this._choirSize = Math.max(0, this._choirSize - 1);
    } else {
      this._combo++;
      if (this._combo > this._maxCombo) this._maxCombo = this._combo;

      // Check choir thresholds
      for (const threshold of this.choirThresholds) {
        if (this._combo === threshold) {
          this._choirSize = Math.min(this._choirSize + 1, this.choirThresholds.length);
          break;
        }
      }
    }

    const points = basePoints * this.getMultiplier();
    this._score += points;

    const result: NoteResult = {
      grade,
      timingOffset,
      dynamic,
      combo: this._combo,
      points,
    };

    this.results.push(result);
    return result;
  }

  getAccuracy(): number {
    if (this.results.length === 0) return 0;
    const maxPossible = this.results.length * perfect;
    const earned = this.results.reduce((sum, r) => {
      if (r.grade === 'perfect') return sum + perfect;
      if (r.grade === 'great') return sum + great;
      if (r.grade === 'good') return sum + good;
      return sum;
    }, 0);
    return earned / maxPossible;
  }

  getLetterGrade(): LetterGrade {
    const acc = this.getAccuracy();
    if (acc >= 0.90) return 'S';
    if (acc >= 0.75) return 'A';
    if (acc >= 0.55) return 'B';
    if (acc >= 0.40) return 'C';
    if (acc >= 0.25) return 'D';
    return 'F';
  }

  getSongResult(songId: string): SongResult {
    const counts = { perfects: 0, greats: 0, goods: 0, misses: 0 };
    for (const r of this.results) {
      if (r.grade === 'perfect') counts.perfects++;
      else if (r.grade === 'great') counts.greats++;
      else if (r.grade === 'good') counts.goods++;
      else counts.misses++;
    }

    return {
      songId,
      score: this._score,
      accuracy: this.getAccuracy(),
      maxCombo: this._maxCombo,
      grade: this.getLetterGrade(),
      noteResults: [...this.results],
      choirSize: this._choirSize,
      ...counts,
    };
  }

  /** Map current combo to dynamic backing level (0-4) */
  getDynamicLevel(): number {
    if (this._combo >= 50) return 4;
    if (this._combo >= 30) return 3;
    if (this._combo >= 10) return 2;
    if (this._combo >= 1) return 1;
    return 0;
  }

  reset(): void {
    this.results = [];
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._choirSize = 0;
  }
}
