/**
 * Audio conversion pipeline: Vox_Final/ WAVs → public/assets/samples/ WebM+MP3
 *
 * For MVP: processes Dah and Doh syllables, AKrr1 only.
 * Trims to 800ms, fades out last 100ms, normalizes, converts to WebM(Opus) + MP3.
 *
 * Usage: npx tsx scripts/convert-samples.ts
 */

import { execSync } from 'child_process';
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = process.cwd();
const VOX_DIR = join(ROOT, 'Vox_Final');
const OUT_DIR = join(ROOT, 'public', 'assets', 'samples');

// Syllables to process for MVP
const SYLLABLES = ['Dah', 'Doh', 'Dmm', 'Bmm', 'Don', 'Doo', 'Nun'];

// Only AKrr1 for MVP (expandable to AKrr2, AKrr3, AKrr4 + ribbon mic later)
const MIC_RR_FILTER = 'AKrr1';

// Note name → MIDI offset within octave
const NOTE_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
};

// MIDI → note name for output filenames
function midiToNoteName(midi: number): string {
  const names = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = names[midi % 12];
  return `${note}${octave}`;
}

// Map velocity range to dynamic level 1-4
function velRangeToDynamic(velLow: number, velHigh: number): number {
  const mid = (velLow + velHigh) / 2;
  if (mid <= 32) return 1;
  if (mid <= 62) return 2;
  if (mid <= 93) return 3;
  return 4;
}

interface SampleEntry {
  syllable: string;
  midi: number;
  dynamic: number;
  url: string;
  fallbackUrl: string;
}

function checkFfmpeg(): void {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    console.error('ffmpeg not found. Please install ffmpeg first.');
    process.exit(1);
  }
}

// Parse filename like PH_Dah_AKrr1_A#2_46_33_62.wav
function parseFilename(filename: string) {
  // Handle note names with # (sharp)
  const match = filename.match(
    /^PH_(\w+)_(AKrr\d)_([A-G]#?)(\d+)_(\d+)_(\d+)_(\d+)\.wav$/
  );
  if (!match) return null;

  const [, syllable, micRr, noteName, octaveStr, midiStr, velLowStr, velHighStr] = match;
  return {
    syllable,
    micRr,
    noteName,
    octave: parseInt(octaveStr),
    midi: parseInt(midiStr),
    velLow: parseInt(velLowStr),
    velHigh: parseInt(velHighStr),
  };
}

function convertSample(
  inputPath: string,
  syllableLower: string,
  noteName: string,
  dynamic: number,
): { webmPath: string; mp3Path: string } {
  const outBase = `${syllableLower}-${noteName}-${dynamic}`;
  const syllableDir = join(OUT_DIR, syllableLower);
  mkdirSync(syllableDir, { recursive: true });

  const webmPath = join(syllableDir, `${outBase}.webm`);
  const mp3Path = join(syllableDir, `${outBase}.mp3`);

  // ffmpeg: trim to 800ms, fade out last 100ms, normalize, convert
  // Using afade for the last 100ms (start at 700ms, duration 100ms)
  const filterChain = 'atrim=0:0.8,afade=t=out:st=0.7:d=0.1,loudnorm=I=-16:TP=-1.5:LRA=11';

  // WebM (Opus)
  if (!existsSync(webmPath)) {
    try {
      execSync(
        `ffmpeg -y -i "${inputPath}" -af "${filterChain}" -c:a libopus -b:a 96k "${webmPath}"`,
        { stdio: 'ignore' }
      );
    } catch {
      console.warn(`  Warning: WebM conversion failed for ${basename(inputPath)}, trying MP3 only`);
    }
  }

  // MP3 fallback
  if (!existsSync(mp3Path)) {
    try {
      execSync(
        `ffmpeg -y -i "${inputPath}" -af "${filterChain}" -c:a libmp3lame -b:a 128k "${mp3Path}"`,
        { stdio: 'ignore' }
      );
    } catch {
      console.warn(`  Warning: MP3 conversion failed for ${basename(inputPath)}`);
    }
  }

  return { webmPath, mp3Path };
}

function generateSilentBackingTracks(): void {
  const backingDir = join(ROOT, 'public', 'assets', 'backing');
  mkdirSync(backingDir, { recursive: true });

  const songs = [
    'amazing-grace',
    'greensleeves',
    'house-rising-sun',
    'scarborough-fair',
    'loch-lomond',
  ];

  for (const song of songs) {
    const outPath = join(backingDir, `${song}.mp3`);
    if (existsSync(outPath)) {
      console.log(`  Backing track exists: ${song}.mp3`);
      continue;
    }
    console.log(`  Generating silent backing: ${song}.mp3`);
    execSync(
      `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 180 -c:a libmp3lame -b:a 64k "${outPath}"`,
      { stdio: 'ignore' }
    );
  }
}

function main(): void {
  checkFfmpeg();

  console.log('=== TypeTune Sample Conversion Pipeline ===\n');

  const manifest: SampleEntry[] = [];

  for (const syllable of SYLLABLES) {
    const syllableLower = syllable.toLowerCase();
    let sampleDir = join(VOX_DIR, `${syllable} Samples`);

    if (!existsSync(sampleDir)) {
      console.warn(`Skipping ${syllable}: directory not found at ${sampleDir}`);
      continue;
    }

    // Some syllables have samples in an "EDIT Samples" subdirectory
    const editSubdir = join(sampleDir, 'EDIT Samples');
    if (existsSync(editSubdir)) {
      sampleDir = editSubdir;
    }

    const files = readdirSync(sampleDir).filter(
      (f) => f.endsWith('.wav') && f.includes(MIC_RR_FILTER)
    );

    console.log(`Processing ${syllable}: ${files.length} files (${MIC_RR_FILTER} only)`);

    let converted = 0;
    for (const file of files) {
      const parsed = parseFilename(file);
      if (!parsed) {
        console.warn(`  Skipping unparseable: ${file}`);
        continue;
      }

      const dynamic = velRangeToDynamic(parsed.velLow, parsed.velHigh);
      const noteName = midiToNoteName(parsed.midi);
      const inputPath = join(sampleDir, file);

      convertSample(inputPath, syllableLower, noteName, dynamic);

      const relBase = `assets/samples/${syllableLower}/${syllableLower}-${noteName}-${dynamic}`;
      manifest.push({
        syllable: syllableLower,
        midi: parsed.midi,
        dynamic,
        url: `${relBase}.webm`,
        fallbackUrl: `${relBase}.mp3`,
      });

      converted++;
      if (converted % 20 === 0) {
        process.stdout.write(`  ${converted}/${files.length}\r`);
      }
    }

    console.log(`  Converted ${converted} samples for ${syllable}`);
  }

  // Deduplicate (same midi+syllable+dynamic from edge velocity overlaps)
  const seen = new Set<string>();
  const deduped = manifest.filter((entry) => {
    const key = `${entry.syllable}-${entry.midi}-${entry.dynamic}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Write manifest
  const manifestData = {
    version: 1,
    generated: new Date().toISOString(),
    samples: deduped.sort((a, b) =>
      a.syllable.localeCompare(b.syllable) || a.midi - b.midi || a.dynamic - b.dynamic
    ),
  };

  writeFileSync(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifestData, null, 2)
  );

  console.log(`\nManifest: ${deduped.length} unique samples`);

  // Generate silent backing tracks
  console.log('\nGenerating silent backing tracks...');
  generateSilentBackingTracks();

  console.log('\nDone!');
}

main();
