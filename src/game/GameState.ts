/**
 * Game state machine: manages screen transitions and global state.
 * Supports Song Mode and Practice Mode flows.
 */

import type { GameScreen, GameMode, SongMeta, SongResult, Lesson, PracticeResult } from '../data/types';

export type StateChangeCallback = (from: GameScreen, to: GameScreen) => void;

export class GameState {
  private _screen: GameScreen = 'menu';
  private _mode: GameMode | null = null;
  private _selectedSong: SongMeta | null = null;
  private _selectedLesson: Lesson | null = null;
  private _lastResult: SongResult | null = null;
  private _lastPracticeResult: PracticeResult | null = null;
  private listeners: StateChangeCallback[] = [];

  get screen(): GameScreen { return this._screen; }
  get mode(): GameMode | null { return this._mode; }
  get selectedSong(): SongMeta | null { return this._selectedSong; }
  get selectedLesson(): Lesson | null { return this._selectedLesson; }
  get lastResult(): SongResult | null { return this._lastResult; }
  get lastPracticeResult(): PracticeResult | null { return this._lastPracticeResult; }

  onChange(cb: StateChangeCallback): void {
    this.listeners.push(cb);
  }

  private transition(to: GameScreen): void {
    const from = this._screen;
    this._screen = to;
    for (const cb of this.listeners) {
      cb(from, to);
    }
  }

  goToMenu(): void {
    this._selectedSong = null;
    this._selectedLesson = null;
    this._lastResult = null;
    this._lastPracticeResult = null;
    this._mode = null;
    this.transition('menu');
  }

  goToModeSelect(): void {
    this.transition('mode-select');
  }

  goToSongSelect(): void {
    this._mode = 'song';
    this.transition('song-select');
  }

  goToLessonSelect(): void {
    this._mode = 'practice';
    this.transition('lesson-select');
  }

  goToLoading(song: SongMeta): void {
    this._selectedSong = song;
    this.transition('loading');
  }

  goToPlaying(): void {
    this.transition('playing');
  }

  goToPracticeLoading(lesson: Lesson): void {
    this._selectedLesson = lesson;
    this.transition('loading');
  }

  goToPracticePlaying(): void {
    this.transition('practice-playing');
  }

  goToResults(result: SongResult): void {
    this._lastResult = result;
    this.transition('results');
  }

  goToPracticeResults(result: PracticeResult): void {
    this._lastPracticeResult = result;
    this.transition('practice-results');
  }

  goToSettings(): void {
    this.transition('settings');
  }

  goToCalibration(): void {
    this.transition('calibration');
  }
}
