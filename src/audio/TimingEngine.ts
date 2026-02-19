/**
 * Timing judgment: evaluates keystroke timing against expected note time.
 */

import type { Grade } from '../data/types';
import gameConfig from '../../configs/game.json';

const { perfectWindowMs, greatWindowMs, goodWindowMs, missWindowMs } = gameConfig.timing;

export interface TimingResult {
  grade: Grade;
  offset: number;     // ms offset (negative = early, positive = late)
  dynamic: number;    // 1-4 dynamic level based on accuracy
}

export class TimingEngine {
  private perfectWindow: number = 0;
  private greatWindow: number = 0;
  private goodWindow: number = 0;
  private missWindow: number = 0;

  private assistMultiplier = 1.0;
  private tempoRate = 1.0;
  private _flowMultiplier = 1.0;

  constructor(assist: boolean = false) {
    this.assistMultiplier = assist ? 1.5 : 1.0;
    this.recalcWindows();
  }

  /** Recalculate all windows from base values, composing all multipliers */
  private recalcWindows(): void {
    const m = this.assistMultiplier * this._flowMultiplier / this.tempoRate;
    this.perfectWindow = perfectWindowMs * m;
    this.greatWindow = greatWindowMs * m;
    this.goodWindow = goodWindowMs * m;
    this.missWindow = missWindowMs * m;
  }

  /** Judge a keystroke at currentTimeMs against expected noteTimeMs */
  judge(currentTimeMs: number, noteTimeMs: number): TimingResult {
    const offset = currentTimeMs - noteTimeMs;
    const absOffset = Math.abs(offset);

    let grade: Grade;
    let dynamic: number;

    if (absOffset <= this.perfectWindow) {
      grade = 'perfect';
      dynamic = 4; // ff - strongest
    } else if (absOffset <= this.greatWindow) {
      grade = 'great';
      dynamic = 3; // f
    } else if (absOffset <= this.goodWindow) {
      grade = 'good';
      dynamic = 2; // mf
    } else {
      grade = 'miss';
      dynamic = 1; // pp
    }

    return { grade, offset, dynamic };
  }

  setAssist(enabled: boolean): void {
    this.assistMultiplier = enabled ? 1.5 : 1.0;
    this.recalcWindows();
  }

  /** Scale timing windows inversely with tempo — slower tempo = wider windows */
  setTempo(rate: number): void {
    this.tempoRate = rate;
    this.recalcWindows();
  }

  /** Adjust flow multiplier based on recent performance */
  adjustFlow(recentGrades: Grade[]): void {
    const last10 = recentGrades.slice(-10);
    if (last10.length < 10) return;

    const perfectGreatCount = last10.filter(g => g === 'perfect' || g === 'great').length;
    const missGoodCount = last10.filter(g => g === 'miss' || g === 'good').length;

    if (perfectGreatCount >= 8) {
      // Tighten: shrink by 15%, minimum 0.6
      this._flowMultiplier = Math.max(0.6, this._flowMultiplier * 0.85);
    } else if (missGoodCount >= 4) {
      // Relax: expand by 15%, maximum 1.5
      this._flowMultiplier = Math.min(1.5, this._flowMultiplier * 1.15);
    } else {
      // Neutral: drift 1% toward 1.0
      this._flowMultiplier += (1.0 - this._flowMultiplier) * 0.01;
    }

    this.recalcWindows();
  }

  /** Get the current flow level for UI display */
  getFlowLevel(): number {
    return this._flowMultiplier;
  }

  /** Reset flow multiplier to baseline */
  resetFlow(): void {
    this._flowMultiplier = 1.0;
    this.recalcWindows();
  }

  get goodWindowMs(): number {
    return this.goodWindow;
  }

  /** The outer miss window — notes auto-miss after this */
  get missWindowValue(): number {
    return this.missWindow;
  }
}
