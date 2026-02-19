/**
 * Finger-to-key mapping for proper touch typing technique.
 * Colors are warm-toned to fit TypeTune's stage aesthetic.
 */

export type FingerZone = 'pinky-l' | 'ring-l' | 'middle-l' | 'index-l' | 'index-r' | 'middle-r' | 'ring-r' | 'pinky-r' | 'thumb';

export interface FingerInfo {
  zone: FingerZone;
  hand: 'left' | 'right';
  label: string;     // e.g. "Left Index"
  homeRow: boolean;
}

/** Color per finger zone — warm stage palette, distinct but not garish */
export const FINGER_COLORS: Record<FingerZone, string> = {
  'pinky-l':  '#c97b84',   // dusty rose
  'ring-l':   '#d4a053',   // warm amber
  'middle-l': '#b8c97b',   // sage green
  'index-l':  '#7bc9a8',   // soft teal
  'index-r':  '#7ba8c9',   // soft blue
  'middle-r': '#b8c97b',   // sage green (mirrors left)
  'ring-r':   '#d4a053',   // warm amber (mirrors left)
  'pinky-r':  '#c97b84',   // dusty rose (mirrors left)
  'thumb':    '#a89bcc',   // lavender
};

/** Every typeable key → which finger should hit it */
export const FINGER_MAP: Record<string, FingerInfo> = {
  // ── Top row ──
  'q': { zone: 'pinky-l',  hand: 'left',  label: 'Left Pinky',  homeRow: false },
  'w': { zone: 'ring-l',   hand: 'left',  label: 'Left Ring',   homeRow: false },
  'e': { zone: 'middle-l', hand: 'left',  label: 'Left Middle', homeRow: false },
  'r': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: false },
  't': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: false },
  'y': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: false },
  'u': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: false },
  'i': { zone: 'middle-r', hand: 'right', label: 'Right Middle',homeRow: false },
  'o': { zone: 'ring-r',   hand: 'right', label: 'Right Ring',  homeRow: false },
  'p': { zone: 'pinky-r',  hand: 'right', label: 'Right Pinky', homeRow: false },

  // ── Home row ──
  'a': { zone: 'pinky-l',  hand: 'left',  label: 'Left Pinky',  homeRow: true },
  's': { zone: 'ring-l',   hand: 'left',  label: 'Left Ring',   homeRow: true },
  'd': { zone: 'middle-l', hand: 'left',  label: 'Left Middle', homeRow: true },
  'f': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: true },
  'g': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: false },
  'h': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: false },
  'j': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: true },
  'k': { zone: 'middle-r', hand: 'right', label: 'Right Middle',homeRow: true },
  'l': { zone: 'ring-r',   hand: 'right', label: 'Right Ring',  homeRow: true },
  ';': { zone: 'pinky-r',  hand: 'right', label: 'Right Pinky', homeRow: true },

  // ── Bottom row ──
  'z': { zone: 'pinky-l',  hand: 'left',  label: 'Left Pinky',  homeRow: false },
  'x': { zone: 'ring-l',   hand: 'left',  label: 'Left Ring',   homeRow: false },
  'c': { zone: 'middle-l', hand: 'left',  label: 'Left Middle', homeRow: false },
  'v': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: false },
  'b': { zone: 'index-l',  hand: 'left',  label: 'Left Index',  homeRow: false },
  'n': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: false },
  'm': { zone: 'index-r',  hand: 'right', label: 'Right Index', homeRow: false },

  // ── Space ──
  ' ': { zone: 'thumb',    hand: 'right', label: 'Thumb',       homeRow: false },
};

/**
 * Get the finger color for a given key character.
 * Returns undefined for unknown keys.
 */
export function getFingerColor(key: string): string | undefined {
  const info = FINGER_MAP[key.toLowerCase()];
  return info ? FINGER_COLORS[info.zone] : undefined;
}

/**
 * Get full finger info for a given key character.
 */
export function getFingerInfo(key: string): FingerInfo | undefined {
  return FINGER_MAP[key.toLowerCase()];
}
