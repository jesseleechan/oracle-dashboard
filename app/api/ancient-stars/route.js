import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Simplified 27 Vedic Nakshatra system mapped to 360 degrees of the zodiac
const LUNAR_MANSIONS = [
  { name: "Ashwini", keyword: "Swift Action & Healing", start: 0, end: 13.33 },
  { name: "Bharani", keyword: "Restraint & Transformation", start: 13.33, end: 26.66 },
  { name: "Krittika", keyword: "Cutting & Purifying Fire", start: 26.66, end: 40 },
  { name: "Rohini", keyword: "Growth & Material Abundance", start: 40, end: 53.33 },
  { name: "Mrigashira", keyword: "Searching & Curiosity", start: 53.33, end: 66.66 },
  { name: "Ardra", keyword: "Storm & Emotional Release", start: 66.66, end: 80 },
  { name: "Punarvasu", keyword: "Renewal & Return of Light", start: 80, end: 93.33 },
  { name: "Pushya", keyword: "Nourishment & Spiritual Wealth", start: 93.33, end: 106.66 },
  { name: "Ashlesha", keyword: "Mystical Coiling & Penetration", start: 106.66, end: 120 },
  { name: "Magha", keyword: "Ancestral Power & Thrones", start: 120, end: 133.33 },
  { name: "Purva Phalguni", keyword: "Rest, Leisure & Creativity", start: 133.33, end: 146.66 },
  { name: "Uttara Phalguni", keyword: "Contracts & Patronage", start: 146.66, end: 160 },
  { name: "Hasta", keyword: "Skill & Manifestation by Hand", start: 160, end: 173.33 },
  { name: "Chitra", keyword: "Brilliant Form & Architecture", start: 173.33, end: 186.66 },
  { name: "Swati", keyword: "Independence & the Wind", start: 186.66, end: 200 },
  { name: "Vishakha", keyword: "Triumph & Singular Focus", start: 200, end: 213.33 },
  { name: "Anuradha", keyword: "Devotion & Subterranean Success", start: 213.33, end: 226.66 },
  { name: "Jyeshtha", keyword: "Eldest, Authority & Occult", start: 226.66, end: 240 },
  { name: "Mula", keyword: "The Root, Destruction & Origins", start: 240, end: 253.33 },
  { name: "Purva Ashadha", keyword: "Invincible Water & Emotion", start: 253.33, end: 266.66 },
  { name: "Uttara Ashadha", keyword: "Unchallenged Victory", start: 266.66, end: 280 },
  { name: "Shravana", keyword: "Listening & Transmission", start: 280, end: 293.33 },
  { name: "Dhanishta", keyword: "Symphony & Material Wealth", start: 293.33, end: 306.66 },
  { name: "Shatabhisha", keyword: "Hundred Physicians & Veils", start: 306.66, end: 320 },
  { name: "Purva Bhadrapada", keyword: "Fire Dragon & Penance", start: 320, end: 333.33 },
  { name: "Uttara Bhadrapada", keyword: "Deep Stillness & Foundations", start: 333.33, end: 346.66 },
  { name: "Revati", keyword: "The Final Journey & Wealth", start: 346.66, end: 360 }
];

const FIXED_STARS = [
  { name: "Alpheratz", sign: "Aries", degree: 14, nature: "Jupiter/Venus", keywords: "Freedom, honor, wealth" },
  { name: "Algol", sign: "Taurus", degree: 26, nature: "Saturn/Jupiter", keywords: "Intense passion, losing one's head, raw power" },
  { name: "Alcyone (Pleiades)", sign: "Gemini", degree: 0, nature: "Moon/Mars", keywords: "Mystical insight, sorrow, third eye" },
  { name: "Aldebaran", sign: "Gemini", degree: 9, nature: "Mars", keywords: "Success through integrity, the Royal Watcher of the East" },
  { name: "Sirius", sign: "Cancer", degree: 14, nature: "Jupiter/Mars", keywords: "Fame, ambition, the glittering dog star" },
  { name: "Castor", sign: "Cancer", degree: 20, nature: "Mercury", keywords: "Mental acuity, duality, storytelling" },
  { name: "Pollux", sign: "Cancer", degree: 23, nature: "Mars", keywords: "Courage, shadow-boxing, brave protection" },
  { name: "Regulus", sign: "Virgo", degree: 0, nature: "Mars/Jupiter", keywords: "Success, royalty, the Watcher of the North" },
  { name: "Spica", sign: "Libra", degree: 23, nature: "Venus/Mars", keywords: "Brilliant success, artistic gifts, a spike of wheat" },
  { name: "Arcturus", sign: "Libra", degree: 24, nature: "Jupiter/Mars", keywords: "Prosperity through travel and learning" },
  { name: "Antares", sign: "Sagittarius", degree: 9, nature: "Mars/Jupiter", keywords: "Intensity, the Watcher of the West, the rival of Mars" },
  { name: "Vega", sign: "Capricorn", degree: 15, nature: "Venus/Mercury", keywords: "Music, charisma, the falling eagle" },
  { name: "Fomalhaut", sign: "Pisces", degree: 4, nature: "Venus/Mercury", keywords: "Magic, dreams, the Watcher of the South" }
];

const ZODIAC_OFFSETS = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330
};

function parseDegreeString(str) {
  const clean = str.replace(' R', '');
  const match = clean.match(/^([A-Za-z]+)\s+(\d+)°(\d+)'?(\d+)?"?/);
  if (!match) return 0;
  const sign = match[1];
  const deg = parseInt(match[2], 10) || 0;
  const min = parseInt(match[3], 10) || 0;
  return ZODIAC_OFFSETS[sign] + deg + (min / 60);
}

function getLunarMansion(moonDegree) {
  const normalized = moonDegree % 360;
  return LUNAR_MANSIONS.find(m => normalized >= m.start && normalized < m.end) || LUNAR_MANSIONS[0];
}

function getActiveFixedStars(transitPlanets) {
  const active = [];
  const ORB = 2.5; // Tighter orb for fixed stars

  const aspectsToCheck = [
    { name: 'Sun', fallbackDegree: parseDegreeString("Cancer 14°0'0") }, // Fallbacks for testing
    { name: 'Moon', fallbackDegree: parseDegreeString("Cancer 14°0'0") },
    { name: 'Jupiter', fallbackDegree: null }
  ];

  for (const planet of aspectsToCheck) {
    const tPlanet = transitPlanets.find(p => p.name === planet.name);
    if (!tPlanet && !planet.fallbackDegree) continue;
    
    const deg = tPlanet ? tPlanet.fullDegree : planet.fallbackDegree;
    if (!deg) continue;

    for (const star of FIXED_STARS) {
      const starDeg = ZODIAC_OFFSETS[star.sign] + star.degree;
      let diff = Math.abs(deg - starDeg);
      if (diff > 180) diff = 360 - diff;
      
      if (diff <= ORB) {
        active.push({
          starName: star.name,
          planetName: planet.name,
          keywords: star.keywords,
          isPotent: ['Spica', 'Regulus', 'Sirius', 'Aldebaran', 'Alcyone (Pleiades)'].includes(star.name)
        });
      }
    }
  }

  // Deduplicate
  const unique = [];
  const names = new Set();
  for (const a of active) {
    if (!names.has(a.starName)) {
      unique.push(a);
      names.add(a.starName);
    }
  }

  return unique.slice(0, 2); // Max 2 stars
}

export async function POST(request) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
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
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(requestBody)
      });
      if (response.ok) {
        const data = await response.json();
        const arr = Array.isArray(data.output) ? data.output : (Array.isArray(data) ? data : []);
        transitPlanets = arr.map(p => ({
          name: p.name || p.planet_name || p.planetName || "Unknown",
          fullDegree: typeof p.fullDegree === 'number' ? p.fullDegree : p.normDegree || 0
        }));
      }
    }

    // Default to a safe degree if API fails
    const moonBase = transitPlanets.find(p => p.name === 'Moon');
    const moonDeg = moonBase ? moonBase.fullDegree : 100; // Arbitrary safe fallback
    
    const mansion = getLunarMansion(moonDeg);
    const activeStars = getActiveFixedStars(transitPlanets);

    let insight = `The Moon resides in ${mansion.name}, bringing ${mansion.keyword.toLowerCase()}. Rest in the natural state of fulfillment.`;

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        let promptCtx = `Moon is in the Lunar Mansion of ${mansion.name} (${mansion.keyword}).\n`;
        if (activeStars.length > 0) {
          promptCtx += `Prominent Fixed Stars active today: ${activeStars.map(s => `${s.starName} conj. ${s.planetName} (${s.keywords})`).join(', ')}`;
        }

        const prompt = `You are an esoteric Neville Goddard whisperer and cosmic chronokrator.
Write a 1-2 sentence reflection combining these ancient star influences:

${promptCtx}

Rules:
- Apply this to manifestation and "Living in the End"
- Make it poetic and deeply personal, like a secret whisper from the heavens
- Do NOT explain the astrology, ONLY deliver the manifestation poetry
- If a Fixed Star is present, weave its royal/archetypal energy in softly`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: prompt,
        });

        if (geminiRes.text) {
          insight = geminiRes.text.trim();
        }
      } catch (e) {
        console.error("Gemini Ancient Stars failed:", e);
      }
    }

    return NextResponse.json({
      mansion: {
        name: mansion.name,
        keyword: mansion.keyword
      },
      stars: activeStars.map(s => ({
        name: s.starName,
        potency: s.isPotent,
        aspect: `Conjunct ${s.planetName}`
      })),
      insight
    });

  } catch (error) {
    console.error("Ancient stars error:", error);
    return NextResponse.json({ 
      mansion: { name: "Ashwini", keyword: "Swift Action & Healing" },
      stars: [],
      insight: "The ancient stars align quietly for you today. It is already done."
    });
  }
}
