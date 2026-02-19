// ── Core Types ──

export type Syllable = 'dah' | 'doh' | 'dmm' | 'bmm' | 'don' | 'doo' | 'nun';

export type Grade = 'perfect' | 'great' | 'good' | 'miss';

export type LetterGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type GameMode = 'song' | 'practice';

export type GameScreen =
  | 'menu'
  | 'mode-select'
  | 'song-select'
  | 'lesson-select'
  | 'loading'
  | 'playing'
  | 'practice-playing'
  | 'results'
  | 'practice-results'
  | 'settings'
  | 'calibration';

// ── Practice / Lesson types ──

export type LessonId = 'home-row' | 'top-row' | 'bottom-row' | 'numbers' | 'mixed';

export interface Lesson {
  id: LessonId;
  title: string;
  description: string;
  keys: string[];           // keys covered in this lesson
  wordPool: string[];       // word bank to draw from
  unlockLevel: number;
  backingTrackUrl?: string; // optional MP3 background music
}

export interface PracticeWord {
  text: string;
  startedAt?: number;       // ms timestamp when first char was typed
  completedAt?: number;     // ms timestamp when last char was typed
}

export interface PracticeResult {
  lessonId: LessonId;
  wordsCompleted: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  wpm: number;
  accuracy: number;         // 0-1
  perKeyStats: Record<string, { hits: number; misses: number }>;
  durationMs: number;
}

// ── Beatmap ──

export interface BeatmapNote {
  char: string;
  time: number;      // ms from song start
  midi: number;       // MIDI note number (34-82)
  duration: number;   // ms
  syllable: Syllable;
}

export interface BeatmapPhrase {
  text: string;
  startTime: number;
  notes: BeatmapNote[];
}

export interface ChordEvent {
  time: number;       // ms from song start
  midi: number[];     // MIDI notes to stack (3-4 note voicing)
  duration: number;   // ms — how long the chord sustains
}

export interface Beatmap {
  songId: string;
  title: string;
  artist: string;
  bpm: number;
  timeSignature: [number, number];
  difficulty: number; // 1-5
  phrases: BeatmapPhrase[];
  chords?: ChordEvent[];
}

// ── Song Meta ──

export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  bpm: number;
  timeSignature: [number, number];
  unlockLevel: number;
  coverColor: string;
  backingTrackUrl: string;
  syllable: Syllable;
}

// ── Samples ──

export interface SampleEntry {
  syllable: Syllable;
  midi: number;
  dynamic: number;   // 1-4
  url: string;
  fallbackUrl: string;
}

export interface SampleManifest {
  version: number;
  generated: string;
  samples: SampleEntry[];
}

// ── Scoring ──

export interface NoteResult {
  grade: Grade;
  timingOffset: number;
  dynamic: number;
  combo: number;
  points: number;
}

export interface SongResult {
  songId: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  grade: LetterGrade;
  noteResults: NoteResult[];
  choirSize: number;
  perfects: number;
  greats: number;
  goods: number;
  misses: number;
}

// ── Player Progress ──

export interface PracticeSessionStats {
  bestWpm: number;
  bestAccuracy: number;
  totalSessions: number;
  totalCharsTyped: number;
  perKeyLifetime: Record<string, { hits: number; misses: number }>;
}

export interface PlayerData {
  level: number;
  songCompletions: Record<string, { highScore: number; bestGrade: LetterGrade }>;
  practiceStats: Record<string, PracticeSessionStats>;
  settings: PlayerSettings;
}

export interface PlayerSettings {
  masterVolume: number;
  backingVolume: number;
  sampleVolume: number;
  showKeyboard: boolean;
  timingAssist: boolean;
  tempo: number;
  voice: Syllable;
  latencyOffsetMs: number;
  flowMode: boolean;
  phraseMode: boolean;
}

export interface PhraseResult {
  phraseIndex: number;
  accuracy: number;
  speedRatio: number;
  grade: Grade;
  text: string;
}
