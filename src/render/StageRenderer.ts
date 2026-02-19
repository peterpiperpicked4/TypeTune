/**
 * Stage renderer: choir silhouettes under warm spotlights.
 * Responsive height, aria-hidden (purely decorative).
 */

export class StageRenderer {
  private container: HTMLElement;
  private choirMembers: HTMLElement[] = [];
  private stageGlow: HTMLElement;
  private maxChoir = 8;
  private currentSize = 0;

  // Stage positions — arranged in a natural choir formation
  private positions = [
    { x: 50, y: 72, scale: 1.0 },    // center front (soloist)
    { x: 32, y: 68, scale: 0.92 },   // left front
    { x: 68, y: 68, scale: 0.92 },   // right front
    { x: 18, y: 58, scale: 0.82 },   // far left
    { x: 82, y: 58, scale: 0.82 },   // far right
    { x: 38, y: 50, scale: 0.72 },   // back left
    { x: 62, y: 50, scale: 0.72 },   // back right
    { x: 50, y: 44, scale: 0.68 },   // back center
  ];

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'stage';
    this.container.setAttribute('aria-hidden', 'true');
    this.container.style.cssText = `
      position: relative;
      width: 100%;
      height: clamp(140px, 25vh, 220px);
      overflow: hidden;
      background:
        radial-gradient(ellipse 120% 80% at 50% 110%, rgba(26, 20, 16, 0.9) 0%, transparent 60%),
        radial-gradient(ellipse 40% 50% at 50% 20%, rgba(212, 168, 83, 0.03) 0%, transparent 70%),
        linear-gradient(180deg, #0c0a0e 0%, #16131a 100%);
    `;

    // Stage floor gradient
    const floor = document.createElement('div');
    floor.style.cssText = `
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 40%;
      background: linear-gradient(180deg, transparent 0%, rgba(26, 20, 16, 0.4) 100%);
      pointer-events: none;
    `;
    this.container.appendChild(floor);

    // Stage glow (responds to combo)
    this.stageGlow = document.createElement('div');
    this.stageGlow.style.cssText = `
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 70% at 50% 90%, rgba(212, 168, 83, 0.0) 0%, transparent 70%);
      transition: all 0.6s var(--tt-ease-out);
      pointer-events: none;
    `;
    this.container.appendChild(this.stageGlow);

    // Subtle spotlight beams
    for (const leftPct of ['20%', '50%']) {
      const spot = document.createElement('div');
      spot.style.cssText = `
        position: absolute;
        top: 0; ${leftPct === '20%' ? 'left' : 'right'}: ${leftPct};
        width: 30%; height: 100%;
        background: linear-gradient(180deg, rgba(212, 168, 83, 0.02) 0%, transparent 60%);
        pointer-events: none;
        clip-path: polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%);
      `;
      this.container.appendChild(spot);
    }

    // Choir members as silhouettes
    for (let i = 0; i < this.maxChoir; i++) {
      const pos = this.positions[i];
      const member = document.createElement('div');
      member.style.cssText = `
        position: absolute;
        left: ${pos.x}%;
        top: ${pos.y}%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        transition: all 0.5s var(--tt-ease-out-expo);
        will-change: transform, opacity;
        filter: drop-shadow(0 0 0px rgba(212, 168, 83, 0));
      `;

      const size = 28 * pos.scale;
      const body = document.createElement('div');
      body.style.cssText = `
        width: ${size}px;
        height: ${size * 1.8}px;
        border-radius: 40% 40% 35% 35%;
        background: linear-gradient(180deg, rgba(212, 168, 83, 0.25) 0%, rgba(212, 168, 83, 0.08) 100%);
        border: 1px solid rgba(212, 168, 83, 0.12);
        position: relative;
      `;

      const head = document.createElement('div');
      const headSize = size * 0.6;
      head.style.cssText = `
        position: absolute;
        top: ${-headSize * 0.75}px;
        left: 50%;
        transform: translateX(-50%);
        width: ${headSize}px;
        height: ${headSize}px;
        border-radius: 50%;
        background: linear-gradient(180deg, rgba(212, 168, 83, 0.3) 0%, rgba(212, 168, 83, 0.12) 100%);
        border: 1px solid rgba(212, 168, 83, 0.15);
      `;
      body.appendChild(head);
      member.appendChild(body);
      this.container.appendChild(member);
      this.choirMembers.push(member);
    }

    parent.appendChild(this.container);
  }

  updateChoir(size: number): void {
    const prevSize = this.currentSize;
    this.currentSize = Math.min(size, this.maxChoir);
    const intensity = this.currentSize / this.maxChoir;

    for (let i = 0; i < this.currentSize; i++) {
      const member = this.choirMembers[i];
      const pos = this.positions[i];
      member.style.filter = `drop-shadow(0 0 ${intensity * 12}px rgba(212, 168, 83, ${intensity * 0.4}))`;

      if (i >= prevSize) {
        // Entrance: force reflow via single RAF for all new members
        member.style.transition = 'none';
        member.style.transform = 'translate(-50%, -50%) scale(0)';
        member.style.opacity = '0';
      } else {
        member.style.transform = `translate(-50%, -50%) scale(${pos.scale})`;
        member.style.opacity = '1';
      }
    }

    // Single RAF for all new entrances
    if (this.currentSize > prevSize) {
      requestAnimationFrame(() => {
        for (let i = prevSize; i < this.currentSize; i++) {
          const member = this.choirMembers[i];
          const pos = this.positions[i];
          member.style.transition = 'all 0.5s var(--tt-ease-out-expo)';
          member.style.transform = `translate(-50%, -50%) scale(${pos.scale})`;
          member.style.opacity = '1';
        }
      });
    }

    // Hide removed
    for (let i = this.currentSize; i < this.maxChoir; i++) {
      const member = this.choirMembers[i];
      member.style.transform = 'translate(-50%, -50%) scale(0)';
      member.style.opacity = '0';
      member.style.filter = 'drop-shadow(0 0 0px rgba(212, 168, 83, 0))';
    }

    // Stage glow
    this.stageGlow.style.background = `
      radial-gradient(ellipse 60% 70% at 50% 90%,
        rgba(212, 168, 83, ${intensity * 0.12}) 0%,
        transparent 70%)
    `;
  }

  get element(): HTMLElement {
    return this.container;
  }
}
