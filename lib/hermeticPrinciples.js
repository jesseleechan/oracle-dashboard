/**
 * Hermetic Principles of the Day — The Kybalion
 * Deterministically cycles through 7 principles based on day of year.
 */

const PRINCIPLES = [
  {
    name: 'Mentalism',
    axiom: 'The All is Mind; the Universe is Mental.',
    interpretation: 'Your assumptions create your reality. The inner conversation is the only causation — what you conceive and believe, you achieve.',
    nevilleGuidance: 'Revise the mental image. The world you see is the world you assumed. Change the assumption and reality rearranges itself.',
    potent: false
  },
  {
    name: 'Correspondence',
    axiom: 'As above, so below; as within, so without.',
    interpretation: 'Your outer world is a perfect mirror of your inner states. To change circumstances, change the feeling within.',
    nevilleGuidance: 'Assume the feeling of the wish fulfilled. The outer world has no choice but to conform to the inner assumption.',
    potent: true
  },
  {
    name: 'Vibration',
    axiom: 'Nothing rests; everything moves; everything vibrates.',
    interpretation: 'Your emotional frequency determines what you attract. Shift your state, shift your timeline.',
    nevilleGuidance: 'Enter the state of the wish fulfilled and vibrate there. Feeling is the secret — your frequency is your prayer.',
    potent: true
  },
  {
    name: 'Polarity',
    axiom: 'Everything is dual; everything has poles.',
    interpretation: 'What you call failure is simply the other pole of success. You can transmute any state by moving along the spectrum.',
    nevilleGuidance: 'There is no opposite to your desire — only degrees. Mentally move along the pole from the unwanted to the wished-for state.',
    potent: false
  },
  {
    name: 'Rhythm',
    axiom: 'Everything flows, out and in; the pendulum-swing manifests in everything.',
    interpretation: 'Natural cycles of expansion and contraction serve creation. Trust the ebb — the tide always returns.',
    nevilleGuidance: 'Do not resist the rhythm. Even in the ebb, persist in the assumption. The pendulum swings back carrying your harvest.',
    potent: false
  },
  {
    name: 'Cause & Effect',
    axiom: 'Every cause has its effect; every effect has its cause.',
    interpretation: 'You are the first cause. Your imaginal act is the seed; circumstances are the fruit. Nothing happens by accident.',
    nevilleGuidance: 'Become the cause consciously. Plant the seed in imagination and let the bridge of incidents unfold naturally.',
    potent: false
  },
  {
    name: 'Gender',
    axiom: 'Gender is in everything; everything has its Masculine and Feminine principles.',
    interpretation: 'The masculine plants the seed (imagination), the feminine gestates it (feeling). Both must unite for creation.',
    nevilleGuidance: 'Conceive the idea clearly (masculine), then feel it real and let it gestate (feminine). Do not dig up the seed.',
    potent: false
  }
];

const PRINCIPLE_COLORS = {
  'Mentalism': '#c9a96e',
  'Correspondence': '#c9a9c9',
  'Vibration': '#e8b4b8',
  'Polarity': '#a9b9c9',
  'Rhythm': '#a9c9b9',
  'Cause & Effect': '#d66a6a',
  'Gender': '#b9a9c9'
};

/**
 * Get today's Hermetic Principle based on day of year.
 */
export function getDailyPrinciple() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const index = dayOfYear % 7;
  const principle = PRINCIPLES[index];

  return {
    ...principle,
    color: PRINCIPLE_COLORS[principle.name],
    dayOfYear,
    index,
    date: now.toDateString()
  };
}

export { PRINCIPLES, PRINCIPLE_COLORS };
