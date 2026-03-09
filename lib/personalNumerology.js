/**
 * Personal Numerology Calculator — Pythagorean Reduction
 * Computes Personal Year, Personal Month, Personal Day.
 * Preserves Master Numbers 11 and 22.
 */

const YEAR_ARCHETYPES = {
  1: { name: 'New Beginnings', archetype: 'Year of initiation, planting seeds, and bold new assumptions. The universe bends to your declared identity.' },
  2: { name: 'Patience & Partnership', archetype: 'Year of quiet gestation, divine partnerships, and trusting the unseen process. Your harvest is forming beneath.' },
  3: { name: 'Creative Expression', archetype: 'Year of joyful creation, self-expression, and letting your inner vision overflow into the world effortlessly.' },
  4: { name: 'Foundation Building', archetype: 'Year of grounding, building permanent structures, and anchoring your assumptions into material reality.' },
  5: { name: 'Transformation', archetype: 'Year of radical change, freedom, and releasing old stories. The bridge dissolves behind you as you cross.' },
  6: { name: 'Harmony & Service', archetype: 'Year of love, responsibility, and nurturing. You are the garden and the gardener simultaneously.' },
  7: { name: 'Esoteric Introspection', archetype: 'Year of spiritual downloads, inner alignment, and deep knowing. The Oracle speaks clearest in your silence.' },
  8: { name: 'Manifestation & Power', archetype: 'Year of material harvest, abundance made mundane, and stepping into your full authority. It was always yours.' },
  9: { name: 'Completion & Release', archetype: 'Year of surrendering old cycles, compassionate detachment, and clearing space for the next grand assumption.' },
  11: { name: 'Master Illumination', archetype: 'Master Year of spiritual awakening, visionary insight, and channeling cosmic frequencies directly into your daily walk.' },
  22: { name: 'Master Builder', archetype: 'Master Year of manifesting the impossible, architecting reality from pure consciousness, and leaving monuments of spirit.' }
};

const NUMBER_GLYPHS = {
  1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤',
  6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨', 11: '⑪', 22: '㉒'
};

const HIGH_MANIFESTATION = new Set([1, 8, 11, 22]);

/**
 * Reduce a number to a single digit, preserving master numbers 11 and 22.
 */
function reduceNumber(num) {
  while (num > 9 && num !== 11 && num !== 22) {
    num = String(num).split('').reduce((sum, d) => sum + parseInt(d), 0);
  }
  return num;
}

/**
 * Sum all digits of a number (without reducing to single digit yet).
 */
function digitSum(num) {
  return String(num).split('').reduce((sum, d) => sum + parseInt(d), 0);
}

/**
 * Calculate Personal Year, Month, Day from birth date.
 * @param {number} birthMonth - 1-12
 * @param {number} birthDay - 1-31
 * @returns {object|null}
 */
export function getPersonalNumerology(birthMonth, birthDay) {
  if (!birthMonth || !birthDay) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Personal Year = reduce(birth month + birth day + current year)
  const yearSum = digitSum(birthMonth) + digitSum(birthDay) + digitSum(currentYear);
  const personalYear = reduceNumber(yearSum);

  // Personal Month = reduce(personal year + current month)
  const monthSum = personalYear + currentMonth;
  const personalMonth = reduceNumber(monthSum);

  // Personal Day = reduce(personal month + current day)
  const daySum = personalMonth + currentDay;
  const personalDay = reduceNumber(daySum);

  const yearInfo = YEAR_ARCHETYPES[personalYear] || YEAR_ARCHETYPES[reduceNumber(personalYear)];

  return {
    personalYear,
    personalMonth,
    personalDay,
    yearName: yearInfo?.name || 'Unknown',
    yearArchetype: yearInfo?.archetype || '',
    yearGlyph: NUMBER_GLYPHS[personalYear] || String(personalYear),
    monthGlyph: NUMBER_GLYPHS[personalMonth] || String(personalMonth),
    dayGlyph: NUMBER_GLYPHS[personalDay] || String(personalDay),
    isHighManifestation: HIGH_MANIFESTATION.has(personalYear),
    isDayHighManifestation: HIGH_MANIFESTATION.has(personalDay),
    date: now.toDateString()
  };
}

export { YEAR_ARCHETYPES, NUMBER_GLYPHS, HIGH_MANIFESTATION, reduceNumber };
