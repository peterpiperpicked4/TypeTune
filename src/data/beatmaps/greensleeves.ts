/**
 * Greensleeves — First verse beatmap
 * Key: A minor, BPM: 88, Time: 3/4, Difficulty: 2
 * MIDI: A3=57, B3=59, C4=60, D4=62, E4=64, F4=65, G4=67, A4=69
 */

import type { Beatmap } from '../types';

// At 88 BPM: quarter = 682ms, eighth = 341ms, half = 1364ms, dotted half = 2045ms
const Q = 682;
const E = 341;
const H = 1364;
const DH = 2045;
const DQ = 1023;

export const greensleeves: Beatmap = {
  songId: 'greensleeves',
  title: 'Greensleeves',
  artist: 'Traditional',
  bpm: 88,
  timeSignature: [3, 4],
  difficulty: 2,
  phrases: [
    {
      text: 'Alas my love',
      startTime: 0,
      notes: [
        { char: 'a', time: 0, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'l', time: Q, midi: 60, duration: H, syllable: 'dah' },
        { char: 'a', time: Q + H, midi: 62, duration: Q, syllable: 'dah' },
        { char: 's', time: Q + H + Q, midi: 64, duration: DQ, syllable: 'dah' },
        { char: ' ', time: Q + H + Q + DQ, midi: 64, duration: E, syllable: 'dah' },
        { char: 'm', time: Q + H + Q + DQ + E, midi: 65, duration: E, syllable: 'dah' },
        { char: 'y', time: Q + H + Q + DQ + E + E, midi: 64, duration: Q, syllable: 'dah' },
        { char: ' ', time: Q + H + Q + DQ + E + E + Q, midi: 62, duration: E, syllable: 'dah' },
        { char: 'l', time: Q + H + Q + DQ + E + E + Q + E, midi: 62, duration: H, syllable: 'dah' },
        { char: 'o', time: Q + H + Q + DQ + E + E + Q + E + H, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'v', time: Q + H + Q + DQ + E + E + Q + E + H + Q, midi: 59, duration: DQ, syllable: 'dah' },
        { char: 'e', time: Q + H + Q + DQ + E + E + Q + E + H + Q + DQ, midi: 60, duration: E, syllable: 'dah' },
      ],
    },
    {
      text: 'you do me wrong',
      startTime: 10000,
      notes: [
        { char: 'y', time: 10000, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'o', time: 10000 + Q, midi: 57, duration: H, syllable: 'dah' },
        { char: 'u', time: 10000 + Q + H, midi: 57, duration: Q, syllable: 'dah' },
        { char: ' ', time: 10000 + Q + H + Q, midi: 57, duration: E, syllable: 'dah' },
        { char: 'd', time: 10000 + Q + H + Q + E, midi: 56, duration: Q, syllable: 'dah' },
        { char: 'o', time: 10000 + Q + H + Q + E + Q, midi: 57, duration: DQ, syllable: 'dah' },
        { char: ' ', time: 10000 + Q + H + Q + E + Q + DQ, midi: 59, duration: E, syllable: 'dah' },
        { char: 'm', time: 10000 + Q + H + Q + E + Q + DQ + E, midi: 60, duration: Q, syllable: 'dah' },
        { char: 'e', time: 10000 + Q + H + Q + E + Q + DQ + E + Q, midi: 62, duration: Q, syllable: 'dah' },
        { char: ' ', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q, midi: 62, duration: E, syllable: 'dah' },
        { char: 'w', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q + E, midi: 60, duration: Q, syllable: 'dah' },
        { char: 'r', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q + E + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'o', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q + E + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'n', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q + E + Q + Q + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'g', time: 10000 + Q + H + Q + E + Q + DQ + E + Q + Q + E + Q + Q + Q + Q, midi: 57, duration: DH, syllable: 'dah' },
      ],
    },
    {
      text: 'to cast me off discourteously',
      startTime: 22000,
      notes: [
        { char: 't', time: 22000, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'o', time: 22000 + Q, midi: 60, duration: H, syllable: 'dah' },
        { char: ' ', time: 22000 + Q + H, midi: 62, duration: E, syllable: 'dah' },
        { char: 'c', time: 22000 + Q + H + E, midi: 62, duration: Q, syllable: 'dah' },
        { char: 'a', time: 22000 + Q + H + E + Q, midi: 64, duration: DQ, syllable: 'dah' },
        { char: 's', time: 22000 + Q + H + E + Q + DQ, midi: 65, duration: E, syllable: 'dah' },
        { char: 't', time: 22000 + Q + H + E + Q + DQ + E, midi: 64, duration: Q, syllable: 'dah' },
        { char: ' ', time: 22000 + Q + H + E + Q + DQ + E + Q, midi: 62, duration: E, syllable: 'dah' },
        { char: 'm', time: 22000 + Q + H + E + Q + DQ + E + Q + E, midi: 62, duration: H, syllable: 'dah' },
        { char: 'e', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H, midi: 59, duration: Q, syllable: 'dah' },
        { char: ' ', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q, midi: 59, duration: E, syllable: 'dah' },
        { char: 'o', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'f', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q, midi: 60, duration: Q, syllable: 'dah' },
        { char: 'f', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: ' ', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q, midi: 57, duration: E, syllable: 'dah' },
        { char: 'd', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E, midi: 56, duration: Q, syllable: 'dah' },
        { char: 'i', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 's', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'c', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'o', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'u', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'r', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q, midi: 60, duration: Q, syllable: 'dah' },
        { char: 't', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q, midi: 59, duration: Q, syllable: 'dah' },
        { char: 'e', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'o', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q + Q, midi: 56, duration: Q, syllable: 'dah' },
        { char: 'u', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 's', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: Q, syllable: 'dah' },
        { char: 'l', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q, midi: 55, duration: Q, syllable: 'dah' },
        { char: 'y', time: 22000 + Q + H + E + Q + DQ + E + Q + E + H + Q + E + Q + Q + Q + E + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q + Q, midi: 57, duration: DH, syllable: 'dah' },
      ],
    },
  ],
};
