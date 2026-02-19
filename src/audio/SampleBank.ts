/**
 * Sample bank: loads manifest, fetches/decodes samples, provides lookup by syllable+pitch+dynamic.
 */

import type { SampleManifest, SampleEntry, Syllable } from '../data/types';
import { AudioEngine } from './AudioEngine';

interface DecodedSample {
  entry: SampleEntry;
  buffer: AudioBuffer;
}

export class SampleBank {
  private engine: AudioEngine;
  private manifest: SampleManifest | null = null;
  private decoded: Map<string, DecodedSample> = new Map();
  private loadingSet: Set<string> = new Set();

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  private key(syllable: string, midi: number, dynamic: number): string {
    return `${syllable}-${midi}-${dynamic}`;
  }

  async loadManifest(url: string = 'assets/samples/manifest.json'): Promise<void> {
    const response = await fetch(url);
    this.manifest = await response.json() as SampleManifest;
  }

  /** Load all samples for a given syllable */
  async loadSyllable(syllable: Syllable): Promise<void> {
    if (!this.manifest) throw new Error('Manifest not loaded');
    if (this.loadingSet.has(syllable)) return; // Already loading this syllable
    this.loadingSet.add(syllable);

    try {
      const entries = this.manifest.samples.filter((s) => s.syllable === syllable);
      const canPlayWebm = this.canPlayWebm();

      const batchSize = 10;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (entry) => {
            const k = this.key(entry.syllable, entry.midi, entry.dynamic);
            if (this.decoded.has(k)) return;

            const url = canPlayWebm ? entry.url : entry.fallbackUrl;
            try {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              const buffer = await this.engine.decodeAudio(arrayBuffer);
              this.decoded.set(k, { entry, buffer });
            } catch {
              // Try fallback if primary failed
              if (canPlayWebm) {
                try {
                  const response = await fetch(entry.fallbackUrl);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = await this.engine.decodeAudio(arrayBuffer);
                  this.decoded.set(k, { entry, buffer });
                } catch {
                  console.warn(`Failed to load sample: ${entry.syllable} midi=${entry.midi} dyn=${entry.dynamic}`);
                }
              }
            }
          })
        );
      }
    } finally {
      this.loadingSet.delete(syllable);
    }
  }

  /** Get a sample buffer for exact syllable + MIDI + dynamic */
  getSample(syllable: Syllable, midi: number, dynamic: number): AudioBuffer | null {
    const k = this.key(syllable, midi, dynamic);
    const sample = this.decoded.get(k);
    if (sample) return sample.buffer;

    // Fallback: try nearest dynamic
    for (const d of this.nearestDynamics(dynamic)) {
      const fallback = this.decoded.get(this.key(syllable, midi, d));
      if (fallback) return fallback.buffer;
    }

    // Fallback: try nearest pitch (within ±2 semitones)
    for (let offset = 1; offset <= 2; offset++) {
      for (const dir of [1, -1]) {
        const nearMidi = midi + offset * dir;
        for (const d of [dynamic, ...this.nearestDynamics(dynamic)]) {
          const fallback = this.decoded.get(this.key(syllable, nearMidi, d));
          if (fallback) return fallback.buffer;
        }
      }
    }

    return null;
  }

  /** Play a sample through the audio engine */
  play(syllable: Syllable, midi: number, dynamic: number, gainScale: number = 1.0): boolean {
    const buffer = this.getSample(syllable, midi, dynamic);
    if (!buffer) return false;
    this.engine.playSample(buffer, gainScale);
    return true;
  }

  /** Play a quiet Dmm (hum) bed note — uses dynamic 1 at low gain */
  playBed(midi: number, gainScale: number = 0.25): boolean {
    return this.play('dmm', midi, 1, gainScale);
  }

  /** Play a Bmm (hit) note — uses dynamic 4 at full gain */
  playHit(midi: number, gainScale: number = 1.0): boolean {
    return this.play('bmm', midi, 4, gainScale);
  }

  /** Play the selected voice syllable at low (soft) dynamics */
  playVoice(syllable: Syllable, midi: number, gainScale: number = 0.8): boolean {
    // Prefer dynamic 1-2 (softer sounds better)
    return this.play(syllable, midi, 1, gainScale) || this.play(syllable, midi, 2, gainScale);
  }

  /** Play a chord (stacked dmm samples) at moderate gain */
  playChord(midiNotes: number[], gainScale: number = 0.18): void {
    for (const midi of midiNotes) {
      this.play('dmm', midi, 2, gainScale);
    }
  }

  get isLoaded(): boolean {
    return this.decoded.size > 0;
  }

  get loadedCount(): number {
    return this.decoded.size;
  }

  private nearestDynamics(d: number): number[] {
    return [1, 2, 3, 4].filter((x) => x !== d).sort((a, b) => Math.abs(a - d) - Math.abs(b - d));
  }

  private canPlayWebm(): boolean {
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/webm; codecs=opus') !== '';
  }
}
