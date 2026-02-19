/**
 * AdaptiveEngine: monitors per-key error rates and adjusts word selection.
 *
 * Strategy:
 *   - Tracks rolling accuracy per key (last N attempts)
 *   - "Weak keys" = keys with accuracy below threshold
 *   - Biases word selection toward words containing weak keys
 *   - Adjusts word length: more errors → shorter words, high accuracy → longer words
 */

export interface KeyStat {
  key: string;
  attempts: number;
  hits: number;
  accuracy: number;  // 0-1
}

export class AdaptiveEngine {
  private keyHistory: Record<string, { hits: number; misses: number }> = {};
  private weakThreshold = 0.75;  // Below this = "weak"
  private windowSize = 20;       // Rolling window per key
  private recentAccuracies: number[] = [];  // last N overall accuracies

  /** Record a keystroke result. */
  record(key: string, correct: boolean): void {
    if (!this.keyHistory[key]) {
      this.keyHistory[key] = { hits: 0, misses: 0 };
    }
    if (correct) {
      this.keyHistory[key].hits++;
    } else {
      this.keyHistory[key].misses++;
    }

    // Cap at window size by decaying oldest
    const stat = this.keyHistory[key];
    const total = stat.hits + stat.misses;
    if (total > this.windowSize) {
      const scale = this.windowSize / total;
      stat.hits = Math.round(stat.hits * scale);
      stat.misses = Math.round(stat.misses * scale);
    }

    // Track overall accuracy
    this.recentAccuracies.push(correct ? 1 : 0);
    if (this.recentAccuracies.length > 50) {
      this.recentAccuracies.shift();
    }
  }

  /** Get keys performing below threshold. */
  getWeakKeys(): KeyStat[] {
    const weak: KeyStat[] = [];
    for (const [key, stat] of Object.entries(this.keyHistory)) {
      const total = stat.hits + stat.misses;
      if (total < 3) continue; // not enough data
      const accuracy = stat.hits / total;
      if (accuracy < this.weakThreshold) {
        weak.push({ key, attempts: total, hits: stat.hits, accuracy });
      }
    }
    return weak.sort((a, b) => a.accuracy - b.accuracy);
  }

  /** Get all key stats sorted by accuracy (worst first). */
  getAllKeyStats(): KeyStat[] {
    const stats: KeyStat[] = [];
    for (const [key, stat] of Object.entries(this.keyHistory)) {
      const total = stat.hits + stat.misses;
      if (total < 1) continue;
      stats.push({ key, attempts: total, hits: stat.hits, accuracy: stat.hits / total });
    }
    return stats.sort((a, b) => a.accuracy - b.accuracy);
  }

  /** Overall recent accuracy (0-1). */
  get recentAccuracy(): number {
    if (this.recentAccuracies.length === 0) return 1;
    const sum = this.recentAccuracies.reduce((a, b) => a + b, 0);
    return sum / this.recentAccuracies.length;
  }

  /**
   * Pick the best word from a pool, biased toward words containing weak keys.
   * Returns the word, or a random one if no weak-key words exist.
   */
  pickWord(pool: string[]): string {
    const weakKeys = new Set(this.getWeakKeys().map(k => k.key));

    if (weakKeys.size === 0 || pool.length === 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Score each word by how many weak keys it contains
    const scored = pool.map(word => {
      let weakCount = 0;
      for (const ch of word) {
        if (weakKeys.has(ch)) weakCount++;
      }
      return { word, weakCount };
    });

    // 70% chance to pick a weak-key word, 30% random
    if (Math.random() < 0.7) {
      // Filter to words with at least one weak key
      const weakWords = scored.filter(s => s.weakCount > 0);
      if (weakWords.length > 0) {
        // Weighted random by weakCount
        const totalWeight = weakWords.reduce((sum, w) => sum + w.weakCount, 0);
        let r = Math.random() * totalWeight;
        for (const w of weakWords) {
          r -= w.weakCount;
          if (r <= 0) return w.word;
        }
        return weakWords[weakWords.length - 1].word;
      }
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Suggested word length range based on recent performance.
   * Returns [minLen, maxLen].
   */
  get suggestedWordLength(): [number, number] {
    const acc = this.recentAccuracy;
    if (acc >= 0.95) return [5, 12];  // High accuracy → longer words
    if (acc >= 0.85) return [4, 8];   // Medium → moderate
    if (acc >= 0.70) return [3, 6];   // Struggling → shorter
    return [2, 5];                     // Very low → very short
  }

  /** Reset all tracked data. */
  reset(): void {
    this.keyHistory = {};
    this.recentAccuracies = [];
  }
}
