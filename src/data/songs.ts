/**
 * Song metadata for all 5 songs.
 */

import type { SongMeta } from './types';

export const songs: SongMeta[] = [
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'Traditional',
    difficulty: 1,
    bpm: 72,
    timeSignature: [3, 4],
    unlockLevel: 1,
    coverColor: '#6c5ce7',
    backingTrackUrl: 'assets/backing/amazing-grace.mp3',
    syllable: 'dah',
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    artist: 'Traditional',
    difficulty: 2,
    bpm: 88,
    timeSignature: [3, 4],
    unlockLevel: 2,
    coverColor: '#00b894',
    backingTrackUrl: 'assets/backing/greensleeves.mp3',
    syllable: 'dah',
  },
  {
    id: 'house-rising-sun',
    title: 'House of the Rising Sun',
    artist: 'Traditional',
    difficulty: 3,
    bpm: 100,
    timeSignature: [6, 8],
    unlockLevel: 3,
    coverColor: '#e17055',
    backingTrackUrl: 'assets/backing/house-rising-sun.mp3',
    syllable: 'doh',
  },
  {
    id: 'scarborough-fair',
    title: 'Scarborough Fair',
    artist: 'Traditional',
    difficulty: 4,
    bpm: 92,
    timeSignature: [3, 4],
    unlockLevel: 4,
    coverColor: '#0984e3',
    backingTrackUrl: 'assets/backing/scarborough-fair.mp3',
    syllable: 'doh',
  },
  {
    id: 'loch-lomond',
    title: 'Loch Lomond',
    artist: 'Traditional',
    difficulty: 5,
    bpm: 110,
    timeSignature: [4, 4],
    unlockLevel: 5,
    coverColor: '#d63031',
    backingTrackUrl: 'assets/backing/loch-lomond.mp3',
    syllable: 'dah',
  },
];
