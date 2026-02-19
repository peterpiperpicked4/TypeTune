/**
 * Scarborough Fair — First verse beatmap
 * Key: D minor (Dorian), BPM: 92, Time: 3/4, Difficulty: 4
 * MIDI: D3=50, E3=52, F3=53, G3=55, A3=57, C4=60, D4=62, E4=64, F4=65
 * Syllable: doh
 */

import type { Beatmap } from '../types';

// At 92 BPM: quarter = 652ms, eighth = 326ms, half = 1304ms, dotted half = 1957ms
const Q = 652;
const E = 326;
const H = 1304;
const DH = 1957;
const DQ = 978;

export const scarboroughFair: Beatmap = {
  songId: 'scarborough-fair',
  title: 'Scarborough Fair',
  artist: 'Traditional',
  bpm: 92,
  timeSignature: [3, 4],
  difficulty: 4,
  phrases: [
    {
      text: 'Are you going to',
      startTime: 0,
      notes: [
        { char: 'a', time: 0, midi: 62, duration: H, syllable: 'doh' },
        { char: 'r', time: H, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'e', time: H + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: ' ', time: H + Q + Q, midi: 62, duration: E, syllable: 'doh' },
        { char: 'y', time: H + Q + Q + E, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'o', time: H + Q + Q + E + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'u', time: H + Q + Q + E + Q + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: ' ', time: H + Q + Q + E + Q + Q + Q, midi: 60, duration: E, syllable: 'doh' },
        { char: 'g', time: H + Q + Q + E + Q + Q + Q + E, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'o', time: H + Q + Q + E + Q + Q + Q + E + Q, midi: 64, duration: DQ, syllable: 'doh' },
        { char: 'i', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ, midi: 65, duration: E, syllable: 'doh' },
        { char: 'n', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ + E, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'g', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ + E + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: ' ', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ + E + Q + Q, midi: 62, duration: E, syllable: 'doh' },
        { char: 't', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ + E + Q + Q + E, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'o', time: H + Q + Q + E + Q + Q + Q + E + Q + DQ + E + Q + Q + E + Q, midi: 57, duration: DH, syllable: 'doh' },
      ],
    },
    {
      text: 'Scarborough Fair',
      startTime: 14000,
      notes: [
        { char: 's', time: 14000, midi: 62, duration: DQ, syllable: 'doh' },
        { char: 'c', time: 14000 + DQ, midi: 64, duration: E, syllable: 'doh' },
        { char: 'a', time: 14000 + DQ + E, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'r', time: 14000 + DQ + E + Q, midi: 69, duration: H, syllable: 'doh' },
        { char: 'b', time: 14000 + DQ + E + Q + H, midi: 69, duration: Q, syllable: 'doh' },
        { char: 'o', time: 14000 + DQ + E + Q + H + Q, midi: 67, duration: Q, syllable: 'doh' },
        { char: 'r', time: 14000 + DQ + E + Q + H + Q + Q, midi: 65, duration: DQ, syllable: 'doh' },
        { char: 'o', time: 14000 + DQ + E + Q + H + Q + Q + DQ, midi: 64, duration: E, syllable: 'doh' },
        { char: 'u', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'g', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'h', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q, midi: 57, duration: DQ, syllable: 'doh' },
        { char: ' ', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q + DQ, midi: 57, duration: E, syllable: 'doh' },
        { char: 'f', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q + DQ + E, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'a', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q + DQ + E + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'i', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q + DQ + E + Q + Q, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'r', time: 14000 + DQ + E + Q + H + Q + Q + DQ + E + Q + Q + DQ + E + Q + Q + Q, midi: 50, duration: DH, syllable: 'doh' },
      ],
    },
    {
      text: 'remember me to one who lives there',
      startTime: 28000,
      notes: [
        { char: 'r', time: 28000, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'm', time: 28000 + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'm', time: 28000 + Q + Q + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'b', time: 28000 + Q + Q + Q + Q + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'r', time: 28000 + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: E, syllable: 'doh' },
        { char: 'm', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q, midi: 57, duration: E, syllable: 'doh' },
        { char: 't', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'o', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q, midi: 62, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q, midi: 62, duration: E, syllable: 'doh' },
        { char: 'o', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E, midi: 64, duration: Q, syllable: 'doh' },
        { char: 'n', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q, midi: 65, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q, midi: 64, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q, midi: 62, duration: E, syllable: 'doh' },
        { char: 'w', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E, midi: 60, duration: Q, syllable: 'doh' },
        { char: 'h', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'o', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q, midi: 57, duration: E, syllable: 'doh' },
        { char: 'l', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'i', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'v', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q, midi: 52, duration: Q, syllable: 'doh' },
        { char: 's', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q, midi: 50, duration: Q, syllable: 'doh' },
        { char: ' ', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q, midi: 50, duration: E, syllable: 'doh' },
        { char: 't', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + E, midi: 53, duration: Q, syllable: 'doh' },
        { char: 'h', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + E + Q, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + E + Q + Q, midi: 57, duration: Q, syllable: 'doh' },
        { char: 'r', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + E + Q + Q + Q, midi: 55, duration: Q, syllable: 'doh' },
        { char: 'e', time: 28000 + Q + Q + Q + Q + Q + Q + Q + Q + E + Q + Q + E + Q + Q + E + Q + Q + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + E + Q + Q + Q + Q, midi: 50, duration: DH, syllable: 'doh' },
      ],
    },
  ],
};
