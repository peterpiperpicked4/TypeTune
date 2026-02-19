/**
 * Amazing Grace — Full first verse (4 phrases) beatmap
 * Key: F# major, BPM: 72, Time: 3/4
 * Timing derived from Peter Hollens' 6-part a cappella MIDI arrangement
 *
 * Correct melody pitches (F# major pentatonic + B):
 *   B3=59, C#4=61, D#4=63, F#4=66, G#4=68, A#4=70, C#5=73
 *
 * Phrase 1: C#4–F#4–A#4–F#4–A#4–G#4–F#4–D#4–B3
 * Phrase 2: C#4–F#4–A#4–F#4–A#4–G#4–C#5
 * Phrase 3: A#4–C#5–A#4–C#5–A#4–F#4–C#4–D#4–B3
 * Phrase 4: C#4–F#4–A#4–F#4–A#4–G#4–F#4
 */

import type { Beatmap } from '../types';

// BPM 72, 3/4 time → quarter = 833ms, measure = 2500ms

export const amazingGrace: Beatmap = {
  songId: 'amazing-grace',
  title: 'Amazing Grace',
  artist: 'Peter Hollens',
  bpm: 72,
  timeSignature: [3, 4],
  difficulty: 1,
  phrases: [
    // ── Phrase 1: "amazing grace how sweet the sound" ──
    // Pickup at beat 3 of intro measure, downbeat at 2500ms
    {
      text: 'amazing grace how sweet the sound',
      startTime: 1000,
      notes: [
        // "a-" (pickup, C#4)
        { char: 'a', time: 1667, midi: 61, duration: 833, syllable: 'bmm' },
        // "-ma-" (F#4, beat 1)
        { char: 'm', time: 2500, midi: 66, duration: 625, syllable: 'bmm' },
        { char: 'a', time: 3125, midi: 66, duration: 625, syllable: 'bmm' },
        // "-zing" (A#4)
        { char: 'z', time: 3750, midi: 70, duration: 312, syllable: 'bmm' },
        { char: 'i', time: 4062, midi: 70, duration: 312, syllable: 'bmm' },
        { char: 'n', time: 4375, midi: 70, duration: 312, syllable: 'bmm' },
        { char: 'g', time: 4688, midi: 70, duration: 312, syllable: 'bmm' },
        // space
        { char: ' ', time: 5000, midi: 70, duration: 200, syllable: 'bmm' },
        // "grace" (F#4, held full measure)
        { char: 'g', time: 5200, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'r', time: 5700, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'a', time: 6200, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'c', time: 6700, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'e', time: 7200, midi: 66, duration: 300, syllable: 'bmm' },
        // space
        { char: ' ', time: 7500, midi: 66, duration: 200, syllable: 'bmm' },
        // "how" (A#4, 2 beats)
        { char: 'h', time: 7700, midi: 70, duration: 500, syllable: 'bmm' },
        { char: 'o', time: 8200, midi: 70, duration: 500, syllable: 'bmm' },
        { char: 'w', time: 8700, midi: 70, duration: 467, syllable: 'bmm' },
        // space
        { char: ' ', time: 9167, midi: 70, duration: 200, syllable: 'bmm' },
        // "sweet" (G#4, 1 beat)
        { char: 's', time: 9367, midi: 68, duration: 167, syllable: 'bmm' },
        { char: 'w', time: 9534, midi: 68, duration: 167, syllable: 'bmm' },
        { char: 'e', time: 9700, midi: 68, duration: 167, syllable: 'bmm' },
        { char: 'e', time: 9867, midi: 68, duration: 167, syllable: 'bmm' },
        { char: 't', time: 10000, midi: 68, duration: 167, syllable: 'bmm' },
        // space
        { char: ' ', time: 10167, midi: 68, duration: 200, syllable: 'bmm' },
        // "the" (F#4, 1 beat)
        { char: 't', time: 10367, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'h', time: 10644, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'e', time: 10833, midi: 66, duration: 278, syllable: 'bmm' },
        // space
        { char: ' ', time: 11111, midi: 66, duration: 200, syllable: 'bmm' },
        // "sound" (D#4 → B3, held ~3 beats)
        { char: 's', time: 11311, midi: 63, duration: 500, syllable: 'bmm' },
        { char: 'o', time: 11811, midi: 63, duration: 500, syllable: 'bmm' },
        { char: 'u', time: 12311, midi: 63, duration: 500, syllable: 'bmm' },
        { char: 'n', time: 12811, midi: 59, duration: 500, syllable: 'bmm' },
        { char: 'd', time: 13311, midi: 59, duration: 689, syllable: 'bmm' },
      ],
    },

    // ── Phrase 2: "that saved a wretch like me" ──
    // Pickup ~beat 3 of rest measure
    {
      text: 'that saved a wretch like me',
      startTime: 14500,
      notes: [
        // "that" (C#4, pickup)
        { char: 't', time: 15000, midi: 61, duration: 208, syllable: 'bmm' },
        { char: 'h', time: 15208, midi: 61, duration: 208, syllable: 'bmm' },
        { char: 'a', time: 15417, midi: 61, duration: 208, syllable: 'bmm' },
        { char: 't', time: 15625, midi: 61, duration: 208, syllable: 'bmm' },
        // space
        { char: ' ', time: 15833, midi: 61, duration: 200, syllable: 'bmm' },
        // "saved" (F#4, ~2 beats)
        { char: 's', time: 16033, midi: 66, duration: 333, syllable: 'bmm' },
        { char: 'a', time: 16367, midi: 66, duration: 333, syllable: 'bmm' },
        { char: 'v', time: 16700, midi: 66, duration: 333, syllable: 'bmm' },
        { char: 'e', time: 17033, midi: 66, duration: 333, syllable: 'bmm' },
        { char: 'd', time: 17367, midi: 66, duration: 300, syllable: 'bmm' },
        // space
        { char: ' ', time: 17667, midi: 66, duration: 200, syllable: 'bmm' },
        // "a" (A#4, 1 beat)
        { char: 'a', time: 17867, midi: 70, duration: 800, syllable: 'bmm' },
        // space
        { char: ' ', time: 18667, midi: 70, duration: 200, syllable: 'bmm' },
        // "wretch" (F#4, ~2 beats)
        { char: 'w', time: 18867, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'r', time: 19144, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'e', time: 19422, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 't', time: 19700, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'c', time: 19978, midi: 66, duration: 278, syllable: 'bmm' },
        { char: 'h', time: 20256, midi: 66, duration: 244, syllable: 'bmm' },
        // space
        { char: ' ', time: 20500, midi: 66, duration: 200, syllable: 'bmm' },
        // "like" (A#4, ~2 beats)
        { char: 'l', time: 20700, midi: 70, duration: 417, syllable: 'bmm' },
        { char: 'i', time: 21117, midi: 70, duration: 417, syllable: 'bmm' },
        { char: 'k', time: 21533, midi: 70, duration: 417, syllable: 'bmm' },
        { char: 'e', time: 21950, midi: 70, duration: 383, syllable: 'bmm' },
        // space
        { char: ' ', time: 22333, midi: 70, duration: 200, syllable: 'bmm' },
        // "me" (G#4 → C#5, held)
        { char: 'm', time: 22533, midi: 68, duration: 1000, syllable: 'bmm' },
        { char: 'e', time: 23533, midi: 73, duration: 1467, syllable: 'bmm' },
      ],
    },

    // ── Phrase 3: "I once was lost but now am found" ──
    {
      text: 'I once was lost but now am found',
      startTime: 25500,
      notes: [
        // "I" (A#4, pickup)
        { char: 'i', time: 26667, midi: 70, duration: 833, syllable: 'bmm' },
        // space
        { char: ' ', time: 27500, midi: 70, duration: 200, syllable: 'bmm' },
        // "once" (C#5, ~1.5 beats)
        { char: 'o', time: 27700, midi: 73, duration: 312, syllable: 'bmm' },
        { char: 'n', time: 28013, midi: 73, duration: 312, syllable: 'bmm' },
        { char: 'c', time: 28325, midi: 73, duration: 312, syllable: 'bmm' },
        { char: 'e', time: 28637, midi: 73, duration: 363, syllable: 'bmm' },
        // space
        { char: ' ', time: 29000, midi: 73, duration: 200, syllable: 'bmm' },
        // "was" (A#4, ~1 beat)
        { char: 'w', time: 29200, midi: 70, duration: 278, syllable: 'bmm' },
        { char: 'a', time: 29478, midi: 70, duration: 278, syllable: 'bmm' },
        { char: 's', time: 29756, midi: 70, duration: 244, syllable: 'bmm' },
        // space
        { char: ' ', time: 30000, midi: 70, duration: 200, syllable: 'bmm' },
        // "lost" (C#5, held full measure)
        { char: 'l', time: 30200, midi: 73, duration: 575, syllable: 'bmm' },
        { char: 'o', time: 30775, midi: 73, duration: 575, syllable: 'bmm' },
        { char: 's', time: 31350, midi: 73, duration: 575, syllable: 'bmm' },
        { char: 't', time: 31925, midi: 73, duration: 575, syllable: 'bmm' },
        // space
        { char: ' ', time: 32500, midi: 73, duration: 200, syllable: 'bmm' },
        // "but" (A#4, ~1.5 beats)
        { char: 'b', time: 32700, midi: 70, duration: 417, syllable: 'bmm' },
        { char: 'u', time: 33117, midi: 70, duration: 417, syllable: 'bmm' },
        { char: 't', time: 33533, midi: 70, duration: 217, syllable: 'bmm' },
        // space
        { char: ' ', time: 33750, midi: 70, duration: 200, syllable: 'bmm' },
        // "now" (F#4, ~1.5 beats)
        { char: 'n', time: 33950, midi: 66, duration: 417, syllable: 'bmm' },
        { char: 'o', time: 34367, midi: 66, duration: 417, syllable: 'bmm' },
        { char: 'w', time: 34783, midi: 66, duration: 217, syllable: 'bmm' },
        // space
        { char: ' ', time: 35000, midi: 66, duration: 200, syllable: 'bmm' },
        // "am" (C#4 → D#4)
        { char: 'a', time: 35200, midi: 61, duration: 800, syllable: 'bmm' },
        { char: 'm', time: 36000, midi: 63, duration: 667, syllable: 'bmm' },
        // space
        { char: ' ', time: 36667, midi: 63, duration: 200, syllable: 'bmm' },
        // "found" (B3, held ~3 beats)
        { char: 'f', time: 36867, midi: 59, duration: 467, syllable: 'bmm' },
        { char: 'o', time: 37333, midi: 59, duration: 467, syllable: 'bmm' },
        { char: 'u', time: 37800, midi: 59, duration: 467, syllable: 'bmm' },
        { char: 'n', time: 38267, midi: 59, duration: 467, syllable: 'bmm' },
        { char: 'd', time: 38733, midi: 59, duration: 767, syllable: 'bmm' },
      ],
    },

    // ── Phrase 4: "was blind but now I see" ──
    {
      text: 'was blind but now I see',
      startTime: 40000,
      notes: [
        // "was" (C#4, pickup)
        { char: 'w', time: 40833, midi: 61, duration: 278, syllable: 'bmm' },
        { char: 'a', time: 41111, midi: 61, duration: 278, syllable: 'bmm' },
        { char: 's', time: 41389, midi: 61, duration: 278, syllable: 'bmm' },
        // space
        { char: ' ', time: 41667, midi: 61, duration: 200, syllable: 'bmm' },
        // "blind" (F#4, ~1.5 beats)
        { char: 'b', time: 41867, midi: 66, duration: 250, syllable: 'bmm' },
        { char: 'l', time: 42117, midi: 66, duration: 250, syllable: 'bmm' },
        { char: 'i', time: 42367, midi: 66, duration: 250, syllable: 'bmm' },
        { char: 'n', time: 42617, midi: 66, duration: 250, syllable: 'bmm' },
        { char: 'd', time: 42867, midi: 66, duration: 300, syllable: 'bmm' },
        // space
        { char: ' ', time: 43167, midi: 66, duration: 200, syllable: 'bmm' },
        // "but" (A#4, ~1 beat)
        { char: 'b', time: 43367, midi: 70, duration: 278, syllable: 'bmm' },
        { char: 'u', time: 43644, midi: 70, duration: 278, syllable: 'bmm' },
        { char: 't', time: 43922, midi: 70, duration: 245, syllable: 'bmm' },
        // space
        { char: ' ', time: 44167, midi: 70, duration: 200, syllable: 'bmm' },
        // "now" (F#4, ~2 beats)
        { char: 'n', time: 44367, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'o', time: 44867, midi: 66, duration: 500, syllable: 'bmm' },
        { char: 'w', time: 45367, midi: 66, duration: 300, syllable: 'bmm' },
        // space
        { char: ' ', time: 45667, midi: 66, duration: 200, syllable: 'bmm' },
        // "I" (A#4, ~1 beat)
        { char: 'i', time: 45867, midi: 70, duration: 800, syllable: 'bmm' },
        // space
        { char: ' ', time: 46667, midi: 70, duration: 200, syllable: 'bmm' },
        // "see" (G#4 → F#4, held long)
        { char: 's', time: 46867, midi: 68, duration: 833, syllable: 'bmm' },
        { char: 'e', time: 47700, midi: 68, duration: 833, syllable: 'bmm' },
        { char: 'e', time: 48533, midi: 66, duration: 1467, syllable: 'bmm' },
      ],
    },
  ],
};
