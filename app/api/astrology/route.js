import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';

// Map zodaic signs to 0-360 degrees
const ZODIAC_OFFSETS = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 7, symbol: '☌' },
  { name: 'Opposition', angle: 180, orb: 7, symbol: '☍' },
  { name: 'Trine', angle: 120, orb: 7, symbol: '△' },
  { name: 'Square', angle: 90, orb: 7, symbol: '□' },
  { name: 'Sextile', angle: 60, orb: 5, symbol: '⚹' }
];

function parseDegreeString(str) {
  // e.g., "Gemini 19°18'59\"" or "Cancer 8°48'" or "Capricorn 23°05' R"
  const clean = str.replace(' R', '');
  const match = clean.match(/^([A-Za-z]+)\s+(\d+)°(\d+)'?(\d+)?"?/);
  if (!match) return 0;

  const sign = match[1];
  const deg = parseInt(match[2], 10) || 0;
  const min = parseInt(match[3], 10) || 0;
  const sec = parseInt(match[4], 10) || 0;

  const offset = ZODIAC_OFFSETS[sign] || 0;
  return offset + deg + (min / 60) + (sec / 3600);
}

function calculateAspects(transitPlanets, natalPlanets) {
  let bestAspect = null;
  let smallestDiff = 999;

  for (const t of transitPlanets) {
    // Skip unimpactful nodes
    if (['Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(t.name)) continue;

    for (const [natalName, natalStr] of Object.entries(natalPlanets)) {
      const natalDeg = parseDegreeString(natalStr);
      let diff = Math.abs(t.fullDegree - natalDeg);
      if (diff > 180) diff = 360 - diff;

      for (const aspect of ASPECTS) {
        const orbDiff = Math.abs(diff - aspect.angle);
        if (orbDiff <= aspect.orb) {
          if (orbDiff < smallestDiff) {
            smallestDiff = orbDiff;
            bestAspect = {
              transitPlanet: t.name,
              natalPlanet: natalName.charAt(0).toUpperCase() + natalName.slice(1),
              aspectName: aspect.name,
              symbol: aspect.symbol,
              orb: orbDiff
            };
          }
        }
      }
    }
  }
  return bestAspect;
}

export async function GET(request) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY;
    const now = new Date();

    const requestBody = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      latitude: 43.6532,     // Toronto
      longitude: -79.3832,   // Toronto
      timezone: -4.0,
      settings: {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
    };

    let transitPlanets = [];

    if (apiKey) {
      const response = await fetch('https://json.freeastrologyapi.com/planets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns an array like [{ name: "Sun", fullDegree: 123.4, ... }]
        if (data.output && Array.isArray(data.output)) {
          transitPlanets = data.output.map(p => ({
            name: p.name || p.planet_name || p.planetName || "Unknown Planet",
            fullDegree: typeof p.fullDegree === 'number' ? p.fullDegree : p.normDegree || 0
          }));
        } else if (Array.isArray(data)) {
           transitPlanets = data.map(p => ({
            name: p.name || p.planet_name || p.planetName || "Unknown Planet",
            fullDegree: typeof p.fullDegree === 'number' ? p.fullDegree : p.normDegree || 0
           }));
        }
      }
    }

    let impactfulTransit = {
      aspect: "Mercury cazimi ☌ Natal Sun",
      synthesis: "The messenger dissolves into solar fire today — your thoughts carry unusual authority. Words written now carry the weight of declarations. Clarity of mind is acute, but the line between insight and overconfidence is thin. Use this window for naming, titling, and committing to the language of your work."
    };

    if (transitPlanets.length > 0) {
      const best = calculateAspects(transitPlanets, USER_CONSTANTS.natalChart);
      if (best) {
        impactfulTransit = {
          aspect: `Transiting ${best.transitPlanet} ${best.symbol} Natal ${best.natalPlanet}`,
          synthesis: `Transiting ${best.transitPlanet} is forming a ${best.aspectName.toLowerCase()} with your natal ${best.natalPlanet} today. This geometric alignment channels direct momentum into your day's work. Focus your creative capacities where ${best.transitPlanet} energy meets your native ${best.natalPlanet} expression.`
        };
      }
    }

    return NextResponse.json({ 
      transit: impactfulTransit,
      natalMatches: USER_CONSTANTS.natalChart 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to calculate aspects" }, { status: 500 });
  }
}
