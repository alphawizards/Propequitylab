/**
 * Theme-reactive chart colors.
 * Reads OKLCH CSS vars at call time so charts pick up light/dark switches.
 * Call getChartColors() inside a component render — not at module level.
 */

export function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  const v = (name) => `oklch(${style.getPropertyValue(name).trim()})`;

  return {
    // Haven raw palette
    sage:      v('--sage'),
    sageSoft:  v('--sage-soft'),
    terra:     v('--terra'),
    terraSoft: v('--terra-soft'),
    gold:      v('--gold'),
    goldSoft:  v('--gold-soft'),
    ocean:     v('--ocean'),
    oceanSoft: v('--ocean-soft'),
    plum:      v('--plum'),
    plumSoft:  v('--plum-soft'),
    ink:       v('--ink'),
    ink2:      v('--ink-2'),
    ink3:      v('--ink-3'),
    line:      v('--line'),
    line2:     v('--line-2'),
    bg:        v('--bg'),
    bg2:       v('--bg-2'),
    // Semantic aliases for chart-specific use
    border:    v('--border'),
    muted:     v('--muted-foreground'),
    positive:  v('--sage'),
    negative:  v('--terra'),
  };
}

/** Ordered 5-color palette for multi-series charts. */
export function getChartPalette() {
  const C = getChartColors();
  return [C.sage, C.ocean, C.gold, C.terra, C.plum];
}
