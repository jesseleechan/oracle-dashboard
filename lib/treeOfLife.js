/**
 * Tree of Life — Sephiroth and Paths Data
 */

export const SEPHIROTH = [
  { name: 'Kether', number: 1, keyword: 'Crown — Divine Will, the Source', x: 200, y: 30, color: '#ffffff' },
  { name: 'Chokmah', number: 2, keyword: 'Wisdom — expansive creative force', x: 320, y: 100, color: '#a9b9c9' },
  { name: 'Binah', number: 3, keyword: 'Understanding — receptive form, Saturn', x: 80, y: 100, color: '#4a4a6a' },
  { name: 'Chesed', number: 4, keyword: 'Mercy — Jupiter, abundance, grace', x: 320, y: 200, color: '#4a6aaa' },
  { name: 'Geburah', number: 5, keyword: 'Strength — Mars, clearing, purification', x: 80, y: 200, color: '#d66a6a' },
  { name: 'Tiphareth', number: 6, keyword: 'Beauty — Sun, heart center, harmony', x: 200, y: 270, color: '#c9a96e' },
  { name: 'Netzach', number: 7, keyword: 'Victory — Venus, desire fulfilled', x: 320, y: 350, color: '#a9c9a9' },
  { name: 'Hod', number: 8, keyword: 'Splendor — Mercury, intellect, craft', x: 80, y: 350, color: '#c9a9c9' },
  { name: 'Yesod', number: 9, keyword: 'Foundation — Moon, imagination, subconscious', x: 200, y: 420, color: '#b9b9d9' },
  { name: 'Malkuth', number: 10, keyword: 'Kingdom — Earth, manifestation, the 3D', x: 200, y: 510, color: '#8a7a5a' }
];

export const PATHS = [
  { from: 'Kether', to: 'Chokmah', number: 11 },
  { from: 'Kether', to: 'Binah', number: 12 },
  { from: 'Kether', to: 'Tiphareth', number: 13 },
  { from: 'Chokmah', to: 'Binah', number: 14 },
  { from: 'Chokmah', to: 'Chesed', number: 15 },
  { from: 'Chokmah', to: 'Tiphareth', number: 16 },
  { from: 'Binah', to: 'Geburah', number: 17 },
  { from: 'Binah', to: 'Tiphareth', number: 18 },
  { from: 'Chesed', to: 'Geburah', number: 19 },
  { from: 'Chesed', to: 'Tiphareth', number: 20 },
  { from: 'Chesed', to: 'Netzach', number: 21 },
  { from: 'Geburah', to: 'Tiphareth', number: 22 },
  { from: 'Geburah', to: 'Hod', number: 23 },
  { from: 'Tiphareth', to: 'Netzach', number: 24 },
  { from: 'Tiphareth', to: 'Yesod', number: 25 },
  { from: 'Tiphareth', to: 'Hod', number: 26 },
  { from: 'Netzach', to: 'Hod', number: 27 },
  { from: 'Netzach', to: 'Yesod', number: 28 },
  { from: 'Netzach', to: 'Malkuth', number: 29 },
  { from: 'Hod', to: 'Yesod', number: 30 },
  { from: 'Hod', to: 'Malkuth', number: 31 },
  { from: 'Yesod', to: 'Malkuth', number: 32 }
];

export function getSephira(name) {
  return SEPHIROTH.find(s => s.name === name);
}

export function getPath(num) {
  return PATHS.find(p => p.number === num);
}
