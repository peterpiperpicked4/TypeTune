/**
 * Lesson curriculum: progressive keyboard coverage.
 * Each lesson introduces new key zones; word pools use only covered keys.
 */

import type { Lesson } from './types';

export const lessons: Lesson[] = [
  {
    id: 'home-row',
    title: 'Home Row',
    description: 'The foundation — where your fingers rest',
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ' '],
    wordPool: [
      'ash', 'ask', 'dad', 'fad', 'gag', 'had', 'jag', 'lad', 'lag', 'sad',
      'sag', 'has', 'gas', 'all', 'add', 'fall', 'hall', 'gall', 'lass', 'glad',
      'half', 'dash', 'flash', 'glass', 'shall', 'salad', 'flask', 'slash',
      'flag', 'shag', 'gash', 'lash', 'hash', 'lass', 'lass',
      'dads', 'fads', 'gags', 'jags', 'lads', 'lags', 'sags', 'asks',
    ],
    unlockLevel: 0,
  },
  {
    id: 'top-row',
    title: 'Top Row',
    description: 'Reach up — q w e r t y u i o p',
    keys: [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', ' ',
    ],
    wordPool: [
      'the', 'that', 'with', 'this', 'they', 'your', 'what', 'said', 'were',
      'ship', 'trip', 'stop', 'fire', 'wish', 'right', 'light', 'quest',
      'write', 'quite', 'spite', 'tiger', 'wider', 'poker', 'outer', 'super',
      'quiet', 'tulip', 'power', 'tower', 'lower', 'gourd', 'youth', 'group',
      'after', 'other', 'there', 'their', 'where', 'those', 'these', 'world',
      'right', 'great', 'house', 'while', 'their', 'people', 'would', 'three',
    ],
    unlockLevel: 1,
  },
  {
    id: 'bottom-row',
    title: 'Bottom Row',
    description: 'Stretch down — z x c v b n m',
    keys: [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'z', 'x', 'c', 'v', 'b', 'n', 'm', ' ',
    ],
    wordPool: [
      'zinc', 'zero', 'zone', 'vibe', 'verb', 'next', 'exam', 'calm', 'bomb',
      'cabin', 'bacon', 'bench', 'bunch', 'climb', 'blown', 'crown', 'crumb',
      'boxing', 'frozen', 'blanch', 'cloven', 'convex', 'exempt', 'oxygen',
      'exclaim', 'combine', 'vitamin', 'between', 'contain', 'problem',
      'maximum', 'complex', 'amazing', 'vibrant', 'mixture', 'explain',
      'because', 'nothing', 'company', 'morning', 'evening', 'another',
    ],
    unlockLevel: 2,
  },
  {
    id: 'numbers',
    title: 'Number Row',
    description: 'The top reach — 1 through 0 and symbols',
    keys: [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'z', 'x', 'c', 'v', 'b', 'n', 'm',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ' ',
    ],
    wordPool: [
      'page 1', 'room 42', 'item 7', 'gate 9', 'code 56', 'zone 3',
      'level 10', 'row 28', 'mix 15', 'step 4', 'plan 6', 'list 80',
      'high 5', 'mark 99', 'song 12', 'track 30', 'score 100', 'goal 75',
    ],
    unlockLevel: 3,
  },
  {
    id: 'mixed',
    title: 'Full Keyboard',
    description: 'Everything together — real sentences',
    keys: [
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'z', 'x', 'c', 'v', 'b', 'n', 'm',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ' ',
    ],
    wordPool: [
      'the quick brown fox jumps over the lazy dog',
      'pack my box with five dozen liquor jugs',
      'how vexingly quick daft zebras jump',
      'bright music fills the concert hall tonight',
      'singing together makes the world feel small',
      'every voice matters in the choir of life',
      'practice makes perfect when you never give up',
      'the spotlight shines on those who persevere',
      'harmony comes from listening to each other',
      'a cappella means voices blend without instruments',
    ],
    unlockLevel: 4,
  },
];
