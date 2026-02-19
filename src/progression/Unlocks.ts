/**
 * Unlock system: checks which songs and syllables are available at a given level.
 */

import type { SongMeta, Syllable } from '../data/types';
import { songs } from '../data/songs';
import gameConfig from '../../configs/game.json';

const syllableUnlocks = gameConfig.progression.syllableUnlockLevels as Record<string, number>;

export function isSongUnlocked(song: SongMeta, playerLevel: number): boolean {
  return playerLevel >= song.unlockLevel;
}

export function getUnlockedSongs(playerLevel: number): SongMeta[] {
  return songs.filter((s) => isSongUnlocked(s, playerLevel));
}

export function getLockedSongs(playerLevel: number): SongMeta[] {
  return songs.filter((s) => !isSongUnlocked(s, playerLevel));
}

export function isSyllableUnlocked(syllable: Syllable, playerLevel: number): boolean {
  const requiredLevel = syllableUnlocks[syllable] ?? 1;
  return playerLevel >= requiredLevel;
}

export function getNextUnlock(playerLevel: number): SongMeta | null {
  const locked = getLockedSongs(playerLevel);
  return locked.length > 0 ? locked[0] : null;
}
