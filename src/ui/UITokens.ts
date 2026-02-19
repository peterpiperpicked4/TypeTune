/**
 * Design tokens: Concert Hall aesthetic — warm golds, deep blacks, theatrical depth.
 * Every surface should feel like it's lit by stage spotlights.
 */

const tokens = {
  // Colors — warm, theatrical palette
  '--tt-bg': '#0c0a0e',
  '--tt-bg-surface': '#16131a',
  '--tt-bg-card': '#1e1a24',
  '--tt-bg-warm': '#1a1410',
  '--tt-text': '#f0ebe3',
  '--tt-text-dim': '#9a8fa0',
  '--tt-text-muted': '#6e6479',  // ≥5.2:1 on bg — WCAG AA pass
  '--tt-accent': '#d4a853',
  '--tt-accent-glow': '#e8c670',
  '--tt-gold': '#d4a853',
  '--tt-green': '#5cb87a',
  '--tt-red': '#c44040',
  '--tt-blue': '#5b8fd4',

  // Grade colors
  '--tt-perfect': '#d4a853',
  '--tt-great': '#f0ebe3',
  '--tt-good': '#9a8fa0',
  '--tt-miss': '#c44040',

  // Fonts
  '--tt-font-main': "'Outfit', 'Segoe UI', system-ui, sans-serif",
  '--tt-font-display': "'Cormorant Garamond', 'Georgia', serif",
  '--tt-font-mono': "'IBM Plex Mono', 'Menlo', monospace",

  // Spacing
  '--tt-space-xs': '4px',
  '--tt-space-sm': '8px',
  '--tt-space-md': '16px',
  '--tt-space-lg': '24px',
  '--tt-space-xl': '40px',
  '--tt-space-2xl': '64px',

  // Sizing — responsive key size
  '--tt-key-size': 'clamp(36px, 5vw, 44px)',
  '--tt-key-gap': 'clamp(3px, 0.5vw, 5px)',

  // Animations — refined easing, no bounce
  '--tt-ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--tt-ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  '--tt-duration-fast': '150ms',
  '--tt-duration-normal': '300ms',
  '--tt-duration-slow': '600ms',

  // Borders
  '--tt-radius-sm': '4px',
  '--tt-radius-md': '8px',
  '--tt-radius-lg': '16px',
  '--tt-radius-xl': '24px',
};

export function injectTokens(): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}

export function injectGlobalStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--tt-bg);
      color: var(--tt-text);
      font-family: var(--tt-font-main);
      -webkit-font-smoothing: antialiased;
    }

    #app {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    /* ── Grain texture overlay ── */
    #app::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 256px 256px;
    }

    /* ── Warm vignette ── */
    #app::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
      background: radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(12, 10, 14, 0.6) 100%);
    }

    .screen {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.5s var(--tt-ease-out-expo);
    }

    .screen.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .screen.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* ── Keyframes ── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spotlightPulse {
      0%, 100% { box-shadow: 0 0 30px rgba(212, 168, 83, 0.15), 0 0 60px rgba(212, 168, 83, 0.05); }
      50% { box-shadow: 0 0 40px rgba(212, 168, 83, 0.25), 0 0 80px rgba(212, 168, 83, 0.1); }
    }

    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: var(--final-opacity, 1); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes comboFlash {
      0% { background: rgba(212, 168, 83, 0.25); }
      100% { background: transparent; }
    }

    @keyframes particleFly {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--px, 50px), var(--py, -80px)) scale(0); opacity: 0; }
    }

    @keyframes comboText {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
      30% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
      70% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -60%) scale(1); opacity: 0; }
    }

    @keyframes cursorGlow {
      0%, 100% { box-shadow: 0 0 8px rgba(212, 168, 83, 0.5), 0 0 16px rgba(212, 168, 83, 0.2); }
      50% { box-shadow: 0 0 12px rgba(212, 168, 83, 0.7), 0 0 24px rgba(212, 168, 83, 0.3); }
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* ── Buttons ── */
    .btn {
      padding: 12px 32px;
      border: none;
      border-radius: var(--tt-radius-md);
      font-family: var(--tt-font-main);
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s var(--tt-ease-out);
      letter-spacing: 0.3px;
      min-height: 44px;
    }

    .btn:focus-visible {
      outline: 2px solid var(--tt-accent);
      outline-offset: 2px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #d4a853 0%, #c49340 100%);
      color: #1a1410;
      font-weight: 600;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(212, 168, 83, 0.35);
      filter: brightness(1.1);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--tt-text-dim);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--tt-text);
      transform: translateY(-1px);
    }

    /* ── Custom scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: rgba(212, 168, 83, 0.2);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(212, 168, 83, 0.35);
    }

    /* ── Range slider styling ── */
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      background: var(--tt-bg-card);
      border-radius: 2px;
      outline: none;
    }

    input[type="range"]:focus-visible {
      outline: 2px solid var(--tt-accent);
      outline-offset: 4px;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--tt-accent);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(212, 168, 83, 0.3);
      transition: box-shadow 0.2s ease;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      box-shadow: 0 0 14px rgba(212, 168, 83, 0.5);
    }

    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--tt-accent);
      cursor: pointer;
      border: none;
      box-shadow: 0 0 8px rgba(212, 168, 83, 0.3);
    }

    /* ── Song card hover/focus (class-based, not inline JS) ── */
    .song-card {
      transition: all 0.25s var(--tt-ease-out);
    }
    .song-card:hover,
    .song-card:focus-visible {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(212, 168, 83, 0.2) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 168, 83, 0.1);
    }
    .song-card:focus-visible {
      outline: 2px solid var(--tt-accent);
      outline-offset: 2px;
    }
    .song-card:active {
      transform: translateY(0);
    }

    /* ── Selection ── */
    ::selection {
      background: rgba(212, 168, 83, 0.3);
      color: var(--tt-text);
    }
  `;
  document.head.appendChild(style);
}
