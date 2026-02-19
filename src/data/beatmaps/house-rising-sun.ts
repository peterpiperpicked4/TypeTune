/**
 * House of the Rising Sun — First verse beatmap
 * Key: A minor, BPM: 100, Time: 6/8, Difficulty: 3
 * MIDI: A3=57, C4=60, D4=62, E4=64, F4=65, G4=67, A4=69
 * Syllable: doh (smoother, more sustained feel)
 */

import type { Beatmap } from '../types';

// At 100 BPM (dotted quarter = beat in 6/8): eighth = 300ms, quarter = 600ms, dotted quarter = 900ms
const E = 300;
const Q = 600;
const DQ = 900;
const H = 1200;
const DH = 1800;

export const houseRisingSun: Beatmap = {
  songId: 'house-rising-sun',
  title: 'House of the Rising Sun',
  artist: 'Traditional',
  bpm: 100,
  timeSignature: [6, 8],
  difficulty: 3,
  phrases: [
    {
      text: 'There is a house',
      startTime: 0,
      notes: [
        { char: 't', time: 0, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'h', time: Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'e', time: Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'r', time: Q + Q + Q, midi: 64, duration: DQ, syllable: 'doh' },
        { char: 'e', time: Q + Q + Q + DQ, midi: 64, duration: E, syllable: 'doh' },
        { char: ' ', time: Q + Q + Q + DQ + E, midi: 64, duration: E, syllable: 'doh' },
        { char: 'i', time: Q + Q + Q + DQ + E + E, midi: 65, duration: Q, syllable: 'doh' },
        { char: 's', time: Q + Q + Q + DQ + E + E + Q, midi: 67, duration: DQ, syllable: 'doh' },
        { char: ' ', time: Q + Q + Q + DQ + E + E + Q + DQ, midi: 67, duration: E, syllable: 'doh' },
        { char: 'a', time: Q + Q + Q + DQ + E + E + Q + DQ + E, midi: 69, duration: H, syllable: 'doh' },
        { char: ' ', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H, midi: 69, duration: E, syllable: 'doh' },
        { char: 'h', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H + E, midi: 67, duration: Q, syllable: 'doh' },
        { char: 'o', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H + E + Q, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'u', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H + E + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: 's', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H + E + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'e', time: Q + Q + Q + DQ + E + E + Q + DQ + E + H + E + Q + Q + Q + Q, midi: 60, duration: DH, syllable: 'doh' },
      ],
    },
    {
      text: 'in New Orleans',
      startTime: 12000,
      notes: [
        { char: 'i', time: 12000, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'n', time: 12000 + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: ' ', time: 12000 + Q + Q, midi: 60, duration: E, syllable: 'doh' },
        { char: 'n', time: 12000 + Q + Q + E, midi: 62, duration: DQ, syllable: 'doh' },
        { char: 'e', time: 12000 + Q + Q + E + DQ, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'w', time: 12000 + Q + Q + E + DQ + Q, midi: 64, duration: DQ, syllable: 'doh' },
        { char: ' ', time: 12000 + Q + Q + E + DQ + Q + DQ, midi: 64, duration: E, syllable: 'doh' },
        { char: 'o', time: 12000 + Q + Q + E + DQ + Q + DQ + E, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'r', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'l', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'e', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'a', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q + Q + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'n', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q + Q + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 's', time: 12000 + Q + Q + E + DQ + Q + DQ + E + Q + Q + Q + Q + Q + Q, midi: 57, duration: DH, syllable: 'doh' },
      ],
    },
    {
      text: 'they call the rising sun',
      startTime: 24000,
      notes: [
        { char: 't', time: 24000, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'h', time: 24000 + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'e', time: 24000 + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'y', time: 24000 + Q + Q + Q, midi: 64, duration: DQ, syllable: 'doh' },
        { char: ' ', time: 24000 + Q + Q + Q + DQ, midi: 64, duration: E, syllable: 'doh' },
        { char: 'c', time: 24000 + Q + Q + Q + DQ + E, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'a', time: 24000 + Q + Q + Q + DQ + E + Q, midi: 67, duration: DQ, syllable: 'doh' },
        { char: 'l', time: 24000 + Q + Q + Q + DQ + E + Q + DQ, midi: 69, duration: Q, syllable: 'doh' },
        { char: 'l', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q, midi: 69, duration: H, syllable: 'doh' },
        { char: ' ', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H, midi: 69, duration: E, syllable: 'doh' },
        { char: 't', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E, midi: 67, duration: Q, syllable: 'doh' },
        { char: 'h', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'e', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: ' ', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q, midi: 64, duration: E, syllable: 'doh' },
        { char: 'r', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'i', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 's', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'i', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'n', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'g', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: ' ', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q, midi: 62, duration: E, syllable: 'doh' },
        { char: 's', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + E, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'u', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + E + Q, midi: 59, duration: Q, syllable: 'doh' },
        { char: 'n', time: 24000 + Q + Q + Q + DQ + E + Q + DQ + Q + H + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + E + Q + Q, midi: 57, duration: DH, syllable: 'doh' },
      ],
    },
  ],
};
