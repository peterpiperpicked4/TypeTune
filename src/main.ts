/**
 * TypeTune — Main entry point.
 * Wires together all game systems: audio, game logic, UI, progression.
 * Supports Song Mode (a cappella typing) and Practice Mode (typing tutor).
 */

import { injectTokens, injectGlobalStyles } from './ui/UITokens';
import { AudioEngine } from './audio/AudioEngine';
import { SampleBank } from './audio/SampleBank';
import { SongPlayer } from './game/SongPlayer';
import { PhraseModeSongPlayer } from './game/PhraseModeSongPlayer';
import { PracticePlayer } from './game/PracticePlayer';
import { InputHandler } from './game/InputHandler';
import { GameState } from './game/GameState';
import { PlayerProgress } from './progression/PlayerProgress';
import { MenuScreen } from './ui/MenuScreen';
import { ModeSelectScreen } from './ui/ModeSelectScreen';
import { SongSelect } from './ui/SongSelect';
import { LessonSelectScreen } from './ui/LessonSelectScreen';
import { PlayScreen } from './ui/PlayScreen';
import { PhrasePlayScreen } from './ui/PhrasePlayScreen';
import { PracticePlayScreen } from './ui/PracticePlayScreen';
import { ResultsScreen } from './ui/ResultsScreen';
import { PracticeResultsScreen } from './ui/PracticeResultsScreen';
import { SettingsScreen } from './ui/SettingsScreen';
import { CalibrationScreen } from './ui/CalibrationScreen';
import { LoadingScreen } from './ui/LoadingScreen';
import { BreakReminder } from './game/BreakReminder';
import type { Beatmap, SongMeta, Lesson, GameScreen } from './data/types';

// ── Beatmap imports ──
import { amazingGrace } from './data/beatmaps/amazing-grace';
import { greensleeves } from './data/beatmaps/greensleeves';
import { houseRisingSun } from './data/beatmaps/house-rising-sun';
import { scarboroughFair } from './data/beatmaps/scarborough-fair';
import { lochLomond } from './data/beatmaps/loch-lomond';

const beatmapRegistry: Record<string, Beatmap> = {
  'amazing-grace': amazingGrace,
  'greensleeves': greensleeves,
  'house-rising-sun': houseRisingSun,
  'scarborough-fair': scarboroughFair,
  'loch-lomond': lochLomond,
};

// ── Initialize ──

injectTokens();
injectGlobalStyles();

const app = document.getElementById('app')!;
const audioEngine = new AudioEngine();
const sampleBank = new SampleBank(audioEngine);
const progress = new PlayerProgress();
const gameState = new GameState();
const input = new InputHandler();

let songPlayer: SongPlayer | null = null;
let phrasePlayer: PhraseModeSongPlayer | null = null;
let practicePlayer: PracticePlayer | null = null;

// ── Break Reminder ──

const breakReminder = new BreakReminder(15); // every 15 minutes

// Simple overlay for break suggestion
function showBreakOverlay(minutes: number): void {
  const existing = document.getElementById('tt-break-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'tt-break-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    background: rgba(12, 10, 14, 0.85);
    animation: fadeIn 0.4s var(--tt-ease-out-expo) forwards;
  `;
  overlay.innerHTML = `
    <div style="
      text-align: center; max-width: 360px; padding: 40px;
      background: var(--tt-bg-card); border-radius: 20px;
      border: 1px solid rgba(212, 168, 83, 0.15);
    ">
      <div style="font-size: 36px; margin-bottom: 12px;">&#9834;</div>
      <div style="
        font-family: var(--tt-font-display);
        font-size: 24px; font-weight: 300; font-style: italic;
        color: var(--tt-text); margin-bottom: 8px;
      ">Time for a break!</div>
      <div style="
        font-size: 13px; color: var(--tt-text-dim); line-height: 1.6; margin-bottom: 24px;
      ">You've been playing for ${minutes} minutes.<br>Stretch, rest your eyes, and grab some water.</div>
      <button class="btn btn-primary tt-break-dismiss" style="
        padding: 12px 36px; border-radius: 24px; font-size: 15px;
      ">I'm ready!</button>
    </div>
  `;

  overlay.querySelector('.tt-break-dismiss')!.addEventListener('click', () => {
    overlay.remove();
    breakReminder.acknowledge();
  });

  document.body.appendChild(overlay);
}

// ── Create UI Screens ──

const menuScreen = new MenuScreen(
  app,
  () => {
    initAudio().then(() => gameState.goToModeSelect());
  },
  () => {
    initAudio().then(() => gameState.goToSettings());
  },
);

const modeSelectScreen = new ModeSelectScreen(
  app,
  (mode) => {
    if (mode === 'song') {
      gameState.goToSongSelect();
    } else {
      gameState.goToLessonSelect();
    }
  },
  () => gameState.goToMenu(),
);

const songSelect = new SongSelect(
  app,
  progress,
  (song: SongMeta) => startSong(song),
  () => gameState.goToModeSelect(),
);

const lessonSelectScreen = new LessonSelectScreen(
  app,
  (lesson: Lesson) => startPractice(lesson),
  () => gameState.goToModeSelect(),
);

const playScreen = new PlayScreen(app);
const phrasePlayScreen = new PhrasePlayScreen(app);
const practicePlayScreen = new PracticePlayScreen(app);

const resultsScreen = new ResultsScreen(
  app,
  () => {
    // Retry: replay same song
    if (gameState.selectedSong) startSong(gameState.selectedSong);
  },
  () => gameState.goToSongSelect(),
);

const practiceResultsScreen = new PracticeResultsScreen(
  app,
  () => {
    // Retry: replay same lesson
    if (gameState.selectedLesson) startPractice(gameState.selectedLesson);
  },
  () => gameState.goToLessonSelect(),
);

const settingsScreen = new SettingsScreen(
  app,
  progress.settings,
  () => gameState.goToMenu(),
  (settings) => {
    progress.updateSettings(settings);
    if (settings.masterVolume !== undefined) audioEngine.setMasterVolume(settings.masterVolume);
    if (settings.backingVolume !== undefined) audioEngine.setBackingVolume(settings.backingVolume);
    if (settings.sampleVolume !== undefined) audioEngine.setSampleVolume(settings.sampleVolume);
    if (settings.tempo !== undefined) audioEngine.setPlaybackRate(settings.tempo);
  },
  () => gameState.goToCalibration(),
);

const calibrationScreen = new CalibrationScreen(
  app,
  audioEngine,
  (offsetMs) => {
    progress.updateSettings({ latencyOffsetMs: offsetMs });
  },
  () => gameState.goToSettings(),
);

const loadingScreen = new LoadingScreen(app);

// ── Screen Management ──

const screens: Record<GameScreen, { show: () => void; hide: () => void; element: HTMLElement }> = {
  'menu': menuScreen,
  'mode-select': modeSelectScreen,
  'song-select': songSelect,
  'lesson-select': lessonSelectScreen,
  'loading': loadingScreen,
  'playing': playScreen,
  'practice-playing': practicePlayScreen,
  'results': resultsScreen,
  'practice-results': practiceResultsScreen,
  'settings': settingsScreen,
  'calibration': calibrationScreen,
};

gameState.onChange((_from: GameScreen, to: GameScreen) => {
  // Hide all screens and mark as inert (prevents keyboard activation on hidden buttons)
  for (const screen of Object.values(screens)) {
    screen.hide();
    screen.element.setAttribute('inert', '');
  }

  // For phrase mode, also hide phrase play screen when not playing
  phrasePlayScreen.hide();
  phrasePlayScreen.element.setAttribute('inert', '');

  // Show target screen and remove inert
  if (to === 'playing' && progress.settings.phraseMode) {
    phrasePlayScreen.show();
    phrasePlayScreen.element.removeAttribute('inert');
    // Keep the 'playing' entry in screens for state tracking — but show phrasePlayScreen
    playScreen.hide();
    playScreen.element.setAttribute('inert', '');
  } else {
    const target = screens[to];
    target.show();
    target.element.removeAttribute('inert');
  }
});

// Start on menu — mark all other screens inert
for (const screen of Object.values(screens)) {
  screen.element.setAttribute('inert', '');
}
phrasePlayScreen.element.setAttribute('inert', '');
menuScreen.show();
menuScreen.element.removeAttribute('inert');

// ── Audio Init (on first user gesture) ──

let audioInitialized = false;

async function initAudio(): Promise<void> {
  if (audioInitialized) return;
  await audioEngine.init();

  // Apply saved volume settings
  const s = progress.settings;
  audioEngine.setMasterVolume(s.masterVolume);
  audioEngine.setBackingVolume(s.backingVolume);
  audioEngine.setSampleVolume(s.sampleVolume);

  // Load sample manifest
  await sampleBank.loadManifest();

  audioInitialized = true;

  // Start break reminder (runs across all game modes)
  breakReminder.start({
    onBreakSuggested: (minutesPlayed) => {
      showBreakOverlay(minutesPlayed);
    },
  });
}

// ── Song Mode: Loading & Playback ──

async function startSong(song: SongMeta): Promise<void> {
  gameState.goToLoading(song);
  loadingScreen.setMessage(`Loading ${song.title}...`);
  loadingScreen.setProgress(0);

  try {
    loadingScreen.setMessage('Loading vocal samples...');
    loadingScreen.setProgress(0.3);

    loadingScreen.setMessage('Loading backing track...');
    loadingScreen.setProgress(0.5);

    const beatmap = beatmapRegistry[song.id];
    if (!beatmap) {
      console.error(`No beatmap found for ${song.id}`);
      gameState.goToSongSelect();
      return;
    }

    // Stop previous players
    if (songPlayer) { songPlayer.stop(); input.stop(); }
    if (phrasePlayer) { phrasePlayer.stop(); input.stop(); }
    if (practicePlayer) { practicePlayer.stop(); input.stop(); }

    // Apply tempo before starting
    const tempo = progress.settings.tempo;
    const voice = progress.settings.voice;
    audioEngine.setPlaybackRate(tempo);

    const isPhraseMode = progress.settings.phraseMode;

    if (isPhraseMode) {
      phrasePlayer = new PhraseModeSongPlayer(audioEngine, sampleBank, {
        voice,
        latencyOffsetMs: progress.settings.latencyOffsetMs,
      });
      await phrasePlayer.loadSong(beatmap, song.backingTrackUrl);

      loadingScreen.setProgress(1);
      await new Promise((r) => setTimeout(r, 300));

      gameState.goToPlaying();

      phrasePlayer.start({
        onCharCorrect: (charIndex, _phraseIndex) => {
          phrasePlayScreen.markCharCorrect(charIndex);
        },
        onCharWrong: (charIndex, _phraseIndex) => {
          phrasePlayScreen.markCharWrong(charIndex);
          audioEngine.playErrorBuzz();
        },
        onPhraseComplete: (result) => {
          phrasePlayScreen.showPhraseFeedback(result);
          if (phrasePlayer) {
            phrasePlayScreen.updateProgress(phrasePlayer.progress);
          }
        },
        onPhraseChange: (_phraseIndex, phraseText, phraseDurationMs) => {
          phrasePlayScreen.setPhrase(phraseText, phraseDurationMs);
        },
        onTick: (_currentTimeMs) => {
          // Could update phrase time progress here
        },
        onSongComplete: (result) => {
          input.stop();
          progress.recordCompletion(song.id, result.score, result.grade);
          gameState.goToResults(result);
          resultsScreen.showResult(result, song.title);
        },
      });

      // Start input handling (with backspace support for phrase mode)
      input.start((key: string) => {
        phrasePlayer?.handleKeystroke(key);
      });

    } else {
      songPlayer = new SongPlayer(audioEngine, sampleBank, {
        timingAssist: progress.settings.timingAssist,
        tempo,
        voice,
        latencyOffsetMs: progress.settings.latencyOffsetMs,
        flowMode: progress.settings.flowMode,
      });
      await songPlayer.loadSong(beatmap, song.backingTrackUrl);

      loadingScreen.setProgress(1);
      await new Promise((r) => setTimeout(r, 300));

      // Switch to play screen
      gameState.goToPlaying();
      playScreen.setBeatmap(beatmap);

      // Highlight first key
      const firstNote = beatmap.phrases[0]?.notes[0];
      if (firstNote) {
        playScreen.highlightNextKey(firstNote.char);
      }

      // Apply keyboard visibility and finger guide
      playScreen.setKeyboardVisible(progress.settings.showKeyboard);
      playScreen.setFingerGuide(true);

      // Start game
      songPlayer.start({
        onNoteHit: (note, grade, combo, points, noteIndex, timingOffset) => {
          playScreen.onNoteHit(note, grade, combo, points, noteIndex, timingOffset);
          playScreen.updateCombo(combo);
          playScreen.updateScore(songPlayer!.scoreSystem.score);
          playScreen.updateProgress(songPlayer!.progress);

          const nextNote = songPlayer!.currentNote;
          if (nextNote) {
            playScreen.highlightNextKey(nextNote.char);
          }
        },
        onNoteMiss: (note, noteIndex) => {
          playScreen.onNoteMiss(note, noteIndex);
          playScreen.updateProgress(songPlayer!.progress);

          const nextNote = songPlayer!.currentNote;
          if (nextNote) {
            playScreen.highlightNextKey(nextNote.char);
          }
        },
        onAutoMiss: (note, noteIndex) => {
          playScreen.onNoteMiss(note, noteIndex);
          playScreen.updateCombo(0);
          playScreen.updateProgress(songPlayer!.progress);

          const nextNote = songPlayer!.currentNote;
          if (nextNote) {
            playScreen.highlightNextKey(nextNote.char);
          }
        },
        onWrongKey: (pressedKey, expectedKey) => {
          playScreen.onWrongKey(pressedKey, expectedKey);
          audioEngine.playErrorBuzz();
        },
        onComboUpdate: (combo, choirSize) => {
          playScreen.updateCombo(combo);
          playScreen.updateChoir(choirSize);
        },
        onPhraseChange: (phraseIndex) => {
          playScreen.onPhraseChange(phraseIndex);
        },
        onTick: (currentTimeMs) => {
          playScreen.updateTimingBall(currentTimeMs);
        },
        onSongComplete: (result) => {
          input.stop();
          progress.recordCompletion(song.id, result.score, result.grade);
          gameState.goToResults(result);
          resultsScreen.showResult(result, song.title);
        },
      });

      // Start input handling
      input.start((key: string) => {
        songPlayer?.handleKeystroke(key);
      });
    }

  } catch (err) {
    console.error('Failed to start song:', err);
    gameState.goToSongSelect();
  }
}

// ── Practice Mode: Loading & Playback ──

async function startPractice(lesson: Lesson): Promise<void> {
  gameState.goToPracticeLoading(lesson);
  loadingScreen.setMessage(`Loading ${lesson.title}...`);
  loadingScreen.setProgress(0);

  try {
    // Stop previous players
    if (songPlayer) { songPlayer.stop(); input.stop(); }
    if (phrasePlayer) { phrasePlayer.stop(); input.stop(); }
    if (practicePlayer) { practicePlayer.stop(); input.stop(); }

    loadingScreen.setProgress(0.5);

    const PRACTICE_DURATION_MS = 60_000; // 60 second sessions
    practicePlayer = new PracticePlayer(audioEngine, PRACTICE_DURATION_MS);
    await practicePlayer.loadLesson(lesson);

    loadingScreen.setProgress(1);
    await new Promise((r) => setTimeout(r, 300));

    // Switch to practice play screen
    gameState.goToPracticePlaying();
    practicePlayScreen.setKeyboardVisible(progress.settings.showKeyboard);
    practicePlayScreen.setFingerGuide(true);
    practicePlayScreen.startTimer(PRACTICE_DURATION_MS);

    // Start practice
    practicePlayer.start({
      onCorrectKey: (_key, charIndex, _wordIndex) => {
        practicePlayScreen.onCorrectChar(charIndex);
      },
      onWrongKey: (pressedKey, expectedKey, _charIndex, _wordIndex) => {
        practicePlayScreen.onWrongChar(pressedKey, expectedKey);
        audioEngine.playErrorBuzz();
      },
      onWordComplete: (_wordIndex, _wordText) => {
        // Word done — next word will be set via onNewWord
      },
      onNewWord: (_wordIndex, wordText) => {
        practicePlayScreen.setWord(wordText);
        if (practicePlayer) {
          practicePlayScreen.setUpcoming(practicePlayer.getUpcomingWords(3));
        }
      },
      onComplete: (result) => {
        input.stop();
        practicePlayScreen.stopTimer();
        progress.recordPracticeSession(result);
        gameState.goToPracticeResults(result);
        practiceResultsScreen.showResult(result, lesson.title);
      },
    });

    // Start input handling
    input.start((key: string) => {
      practicePlayer?.handleKeystroke(key);
    });

  } catch (err) {
    console.error('Failed to start practice:', err);
    gameState.goToLessonSelect();
  }
}

// ── Global Key Handlers ──

window.addEventListener('keydown', (e) => {
  // Escape to pause/unpause during gameplay
  if (e.key === 'Escape' && gameState.screen === 'playing') {
    e.preventDefault();

    if (progress.settings.phraseMode && phrasePlayer) {
      if (phrasePlayer.isPlaying) {
        phrasePlayer.pause();
        input.pause();
      } else {
        phrasePlayer.resume();
        input.resume();
      }
    } else if (songPlayer) {
      if (songPlayer.isPlaying) {
        songPlayer.pause();
        input.pause();
      } else {
        songPlayer.resume();
        input.resume();
      }
    }
  }

  // Escape to stop practice
  if (e.key === 'Escape' && gameState.screen === 'practice-playing' && practicePlayer) {
    e.preventDefault();
    practicePlayer.stop();
    practicePlayScreen.stopTimer();
    input.stop();
    gameState.goToLessonSelect();
  }

  // R to retry on results screen
  if (e.key === 'r' && gameState.screen === 'results' && gameState.selectedSong) {
    e.preventDefault();
    startSong(gameState.selectedSong);
  }

  // R to retry on practice results screen
  if (e.key === 'r' && gameState.screen === 'practice-results' && gameState.selectedLesson) {
    e.preventDefault();
    startPractice(gameState.selectedLesson);
  }
});
