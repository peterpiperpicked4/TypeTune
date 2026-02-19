/**
 * Song player: processes beatmap against current time, handles keystrokes, drives gameplay.
 *
 * Audio design:
 *   - Bmm HIT: full sample plays ONLY on correct keystroke (reward)
 *   - Miss: no auto-miss — player goes at their own pace
 */

import type { Beatmap, BeatmapNote, Grade, SongResult, Syllable } from '../data/types';
import { AudioEngine } from '../audio/AudioEngine';
import { SampleBank } from '../audio/SampleBank';
import { TimingEngine } from '../audio/TimingEngine';
import { ScoreSystem } from './ScoreSystem';

export interface SongPlayerCallbacks {
  onNoteHit: (note: BeatmapNote, grade: Grade, combo: number, points: number, noteIndex: number, timingOffset: number) => void;
  onNoteMiss: (note: BeatmapNote, noteIndex: number) => void;
  onAutoMiss?: (note: BeatmapNote, noteIndex: number) => void;
  onWrongKey?: (pressedKey: string, expectedKey: string) => void;
  onComboUpdate: (combo: number, choirSize: number) => void;
  onPhraseChange: (phraseIndex: number) => void;
  onSongComplete: (result: SongResult) => void;
  onTick?: (currentTimeMs: number) => void;
  onFlowUpdate?: (flowLevel: number) => void;
}

export interface SongPlayerOptions {
  timingAssist?: boolean;
  tempo?: number;
  voice?: Syllable;
  latencyOffsetMs?: number;
  flowMode?: boolean;
}

export class SongPlayer {
  private engine: AudioEngine;
  private sampleBank: SampleBank;
  private timing: TimingEngine;
  private score: ScoreSystem;
  private beatmap: Beatmap | null = null;
  private callbacks: SongPlayerCallbacks | null = null;

  private allNotes: BeatmapNote[] = [];
  private currentNoteIndex = 0;
  private currentPhraseIndex = 0;
  private playing = false;
  private animFrameId = 0;
  private voice: Syllable = 'dah';
  private latencyOffset = 0;
  private flowMode = false;
  private recentGrades: Grade[] = [];
  private lastDynamicLevel = -1;

  constructor(engine: AudioEngine, sampleBank: SampleBank, options: SongPlayerOptions = {}) {
    this.engine = engine;
    this.sampleBank = sampleBank;
    this.voice = options.voice ?? 'dah';
    this.latencyOffset = options.latencyOffsetMs ?? 0;
    this.flowMode = options.flowMode ?? false;

    const timingAssist = options.timingAssist ?? false;
    const tempo = options.tempo ?? 1.0;

    this.timing = new TimingEngine(timingAssist);
    if (tempo < 1.0) {
      this.timing.setTempo(tempo);
    }

    this.score = new ScoreSystem();
  }

  async loadSong(beatmap: Beatmap, backingUrl: string): Promise<void> {
    this.beatmap = beatmap;
    this.allNotes = beatmap.phrases.flatMap((p) => p.notes);
    this.currentNoteIndex = 0;
    this.currentPhraseIndex = 0;
    this.score.reset();
    this.recentGrades = [];
    this.lastDynamicLevel = -1;
    this.timing.resetFlow();

    // Load backing track
    await this.engine.loadBacking(backingUrl);

    // Load selected voice samples (played on correct keystroke)
    await this.sampleBank.loadSyllable(this.voice);
  }

  start(callbacks: SongPlayerCallbacks): void {
    this.callbacks = callbacks;
    this.playing = true;
    this.engine.playBacking();

    // Start at muffled level
    this.engine.setBackingDynamicLevel(0);
    this.lastDynamicLevel = 0;

    this.startTick();
  }

  /** RAF loop that drives the timing ball, auto-misses, and advances phrases by time. */
  private startTick(): void {
    const tick = () => {
      if (!this.playing) return;
      const t = this.engine.backingPositionMs;

      // Auto-miss: if song clock has passed note.time + goodWindow, auto-miss it
      this.processAutoMiss(t);

      // Advance phrase by time (so lyrics change even if player hasn't typed yet)
      this.advancePhraseByTime(t);

      // Drive the timing ball / note highway
      this.callbacks?.onTick?.(t);

      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  /** Auto-miss notes that the player didn't type in time */
  private processAutoMiss(currentTimeMs: number): void {
    const autoMissWindow = this.timing.missWindowValue;

    while (this.currentNoteIndex < this.allNotes.length) {
      const note = this.allNotes[this.currentNoteIndex];
      if (currentTimeMs <= note.time + autoMissWindow) break;

      // This note has passed — auto-miss
      this.score.recordHit('miss', currentTimeMs - note.time, 1);
      this.recordGradeForFlow('miss');
      this.callbacks?.onAutoMiss?.(note, this.currentNoteIndex);
      this.callbacks?.onComboUpdate(this.score.combo, this.score.choirSize);
      this.updateDynamicBacking(true);
      this.currentNoteIndex++;

      // Check if we crossed into a new phrase
      this.updatePhraseByPosition();

      // Check if song is complete
      if (this.currentNoteIndex >= this.allNotes.length) {
        this.complete();
        return;
      }
    }
  }

  /** Switch to the next phrase when the song clock reaches it. */
  private advancePhraseByTime(currentTimeMs: number): void {
    if (!this.beatmap) return;
    const phrases = this.beatmap.phrases;
    for (let p = this.currentPhraseIndex + 1; p < phrases.length; p++) {
      // Switch 500ms before the phrase's first note, or at startTime
      const switchTime = phrases[p].startTime;
      if (currentTimeMs >= switchTime) {
        this.currentPhraseIndex = p;
        this.callbacks?.onPhraseChange(this.currentPhraseIndex);
      }
    }
  }

  /** Advance phrase display based on player's note position (not time). */
  private updatePhraseByPosition(): void {
    if (!this.beatmap) return;
    const phrases = this.beatmap.phrases;
    // Count notes per phrase to find which phrase the current note belongs to
    let noteCount = 0;
    for (let p = 0; p < phrases.length; p++) {
      noteCount += phrases[p].notes.length;
      if (this.currentNoteIndex < noteCount) {
        if (p !== this.currentPhraseIndex) {
          this.currentPhraseIndex = p;
          this.callbacks?.onPhraseChange(this.currentPhraseIndex);
        }
        return;
      }
    }
  }

  handleKeystroke(key: string): void {
    if (!this.playing || this.currentNoteIndex >= this.allNotes.length) return;

    const activeNote = this.allNotes[this.currentNoteIndex];
    // Apply latency compensation: shift player's perceived time backward
    const currentTime = this.engine.backingPositionMs - this.latencyOffset;

    if (key === activeNote.char.toLowerCase()) {
      // Correct key — play selected voice at this pitch (skip sound for spaces)
      if (activeNote.char !== ' ') {
        this.sampleBank.playVoice(this.voice, activeNote.midi);
      }

      // Timing tracked for scoring — but correct key NEVER counts as miss
      const result = this.timing.judge(currentTime, activeNote.time);
      const grade = result.grade === 'miss' ? 'good' as const : result.grade;
      const dynamic = result.grade === 'miss' ? 2 : result.dynamic;
      const noteResult = this.score.recordHit(grade, result.offset, dynamic);

      this.recordGradeForFlow(grade);

      this.callbacks?.onNoteHit(activeNote, grade, this.score.combo, noteResult.points, this.currentNoteIndex, result.offset);
      this.callbacks?.onComboUpdate(this.score.combo, this.score.choirSize);
      this.updateDynamicBacking(false);
      this.currentNoteIndex++;

      // Check if song is complete
      if (this.currentNoteIndex >= this.allNotes.length) {
        this.complete();
        return;
      }

      // Check if we crossed into a new phrase
      this.updatePhraseByPosition();
    } else {
      // Wrong key — notify UI for visual/audio feedback
      this.callbacks?.onWrongKey?.(key, activeNote.char.toLowerCase());
    }
  }

  /** Track grade for flow mode and adjust timing windows */
  private recordGradeForFlow(grade: Grade): void {
    this.recentGrades.push(grade);
    if (this.recentGrades.length > 10) {
      this.recentGrades.shift();
    }
    if (this.flowMode) {
      this.timing.adjustFlow(this.recentGrades);
      this.callbacks?.onFlowUpdate?.(this.timing.getFlowLevel());
    }
  }

  /** Update dynamic backing level based on combo */
  private updateDynamicBacking(isComboBreak: boolean): void {
    if (isComboBreak && this.score.combo === 0 && this.lastDynamicLevel > 1) {
      this.engine.dipBackingOnComboBreak();
      this.lastDynamicLevel = 1;
      return;
    }

    const level = this.score.getDynamicLevel();
    if (level !== this.lastDynamicLevel) {
      this.engine.setBackingDynamicLevel(level);
      this.lastDynamicLevel = level;
    }
  }

  private complete(): void {
    this.playing = false;
    this.engine.stopBacking();

    if (this.beatmap && this.callbacks) {
      this.callbacks.onSongComplete(this.score.getSongResult(this.beatmap.songId));
    }
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
  get currentNote(): BeatmapNote | null {
    return this.currentNoteIndex < this.allNotes.length ? this.allNotes[this.currentNoteIndex] : null;
  }
  get currentPhrase(): number { return this.currentPhraseIndex; }
  get progress(): number {
    return this.allNotes.length > 0 ? this.currentNoteIndex / this.allNotes.length : 0;
  }
  get scoreSystem(): ScoreSystem { return this.score; }
}
