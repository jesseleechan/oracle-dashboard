import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';
import { GoogleGenAI, Type } from '@google/genai';
import { Moon } from 'lunarphase-js';

function buildSynthesisContext(data) {
  const parts = [];
  
  if (data.currentPhase) parts.push(`Moon Phase: ${data.currentPhase}`);
  if (data.universalDay) parts.push(`Universal Day Number: ${data.universalDay}`);
  if (data.transit) parts.push(`Daily Transit: ${data.transit.aspect}`);
  if (data.tarotCards) parts.push(`Tarot Cards Drawn: ${data.tarotCards}`);
  
  if (data.planetaryHour) parts.push(`Planetary Hour: ${data.planetaryHour}`);
  if (data.personalYear) parts.push(`Personal Numerology: Year ${data.personalYear}${data.yearArchetype ? ` (${data.yearArchetype})` : ''}, Month ${data.personalMonth}, Day ${data.personalDay}`);
  
  if (data.hermeticPrinciple) parts.push(`Hermetic Principle: ${data.hermeticPrinciple}${data.hermeticAxiom ? ` — "${data.hermeticAxiom}"` : ''}`);
  
  if (data.mappedSephira || data.mappedPath) {
    const treeParts = [];
    if (data.mappedSephira) treeParts.push(`Sephira: ${data.mappedSephira}`);
    if (data.mappedPath) treeParts.push(`Path: ${data.mappedPath}`);
    parts.push(`Tree of Life Mapping: ${treeParts.join(', ')}`);
  }
  
  if (data.dreamInsight) parts.push(`Morning Dream Wisdom: "${data.dreamInsight}"`);
  if (data.synchronicityInsight) parts.push(`Noted Synchronicity: "${data.synchronicityInsight}"`);
  
  if (data.assumptionText) parts.push(`Living in the End (Assumption): "${data.assumptionText}" (Feeling intensity: ${data.feelingRating || '?'}/10)`);
  if (data.sensoryScript) parts.push(`Active Sensory Script: "${data.sensoryScript.substring(0, 100)}..."`);
  
  if (data.ancientStarsInsight) parts.push(`Fixed Stars & Lunar Mansion: ${data.ancientStarsInsight}`);
  
  if (data.asteroidWisdom && data.asteroidWisdom.length > 0) {
    parts.push(`Asteroid Whispers: ${data.asteroidWisdom.map(a => `${a.name} (${a.transit}): ${a.insight}`).join(' | ')}`);
  }
  
  if (data.dailyPattern) parts.push(`Saved Macro-Pattern to Integrate: "${data.dailyPattern}"`);
  
  return parts.map(p => `- ${p}`).join('\n');
}

export async function POST(request) {
  try {
    const {
      tarotCards, universalDay, transit, geminiSuffix, customApiKey,
      planetaryHour, personalYear, personalMonth, personalDay, yearArchetype,
      hermeticPrinciple, hermeticAxiom,
      assumptionText, feelingRating,
      mappedSephira, mappedPath,
      dreamInsight, synchronicityInsight,
      sensoryScript,
      asteroidWisdom,
      ancientStarsInsight,
      dailyPattern,
      deepen
    } = await request.json();
    
    if (!tarotCards || !universalDay || !transit) {
      return NextResponse.json({ error: "Missing required cosmic data" }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const currentPhase = Moon.lunarPhase();

    // Count active layers for depth tracking
    const layers = [];
    if (planetaryHour) layers.push('planetary');
    if (personalYear) layers.push('numerology');
    if (hermeticPrinciple) layers.push('hermetic');
    if (mappedSephira || mappedPath) layers.push('tree');
    if (dreamInsight || synchronicityInsight) layers.push('dream');
    if (assumptionText) layers.push('assumption');
    if (sensoryScript) layers.push('sensory');
    if (asteroidWisdom && asteroidWisdom.length > 0) layers.push('asteroid');
    if (ancientStarsInsight) layers.push('stars');
    if (dailyPattern) layers.push('pattern');
    const depth = layers.length;

    const contextString = buildSynthesisContext({
      currentPhase, universalDay, transit, tarotCards,
      planetaryHour, personalYear, personalMonth, personalDay, yearArchetype,
      hermeticPrinciple, hermeticAxiom, mappedSephira, mappedPath,
      dreamInsight, synchronicityInsight, assumptionText, feelingRating,
      sensoryScript, ancientStarsInsight, asteroidWisdom, dailyPattern
    });

    const prompt = `You are a unified esoteric oracle for ${USER_CONSTANTS.name}, a ${USER_CONSTANTS.profession}.

CORE LAW: NEVILLE GODDARD'S "LAW OF REVERSE EFFORT" — never advise hustling, grinding, or forcing. All guidance flows from the feeling of the wish fulfilled, calm certainty, and natural allowing. Success is already an established fact.

TODAY'S COSMIC FIELD:
${contextString}

${geminiSuffix ? `USER DIRECTIVES: ${geminiSuffix}\n` : ''}

SYNTHESIS PARADIGM:
${depth >= 4 ? `ALL LAYERS ARE ACTIVE (${depth}). This is a moment of deep, total alignment. The synthesis must reflect this profound esoteric resonance.` : ''}
Weave EVERY active influence into a SINGLE, hypnotic, continuously flowing prose message. ABSOLUTELY NO BULLET POINTS. NO NUMBERED LISTS. NO SECTION HEADINGS. Do not list the transits back to me. Speak directly to the soul and subconscious, translating all these technical astrological, numerological, and qabalistic details into a pure emotional and spiritual landscape.

Structure exactly 2 paragraphs:
Paragraph 1: The Cosmic Weather. Synthesize the moon, transit, hour, numerology, fixed stars, and asteroids into a lush, atmospheric description of today's energy.
Paragraph 2: The Oracle's Command. Filter the Tarot through the Hermetic Principle, Tree of Life, and Dream/Synchronicity wisdom. Connect this deeply to the Living in the End assumption. 
${deepen ? '- Go DEEPER: emphasize shadow layers, ancestral lessons, and unseen orchestrations pulling the wish into physical reality.' : ''}

End the second paragraph with a natural, gentle command for tonight's SATS (State Akin to Sleep). 
Tone: lyrical, mysterious, intimately knowing, grounded in absolute manifestation certainty.

Return a strict JSON object:
- tags: 3 relevant # tags
- insight: The full 2-paragraph flowing prose oracle (separate paragraphs with exactly one \\n\\n, DO NOT use bullet points or dashes)
- energyRatings: 8 objects scoring { category, rating } — categories: Career Ambition, Spiritual Attunement, Financial Resources, Mental Flow, Emotional State, Social Connection, Physical Vitality, Romantic Charge — ratings: "Strong", "Active", or "Light"
- layersActive: ${JSON.stringify(layers)}
- depth: ${depth}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 relevant tags starting with a #"
            },
            insight: {
              type: Type.STRING,
              description: "A detailed 2-paragraph unified oracle reading. Separate paragraphs with newline."
            },
            energyRatings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  rating: { type: Type.STRING }
                },
                required: ["category", "rating"]
              }
            }
          },
          required: ["tags", "insight", "energyRatings"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    // Attach layer metadata
    parsed.layersActive = layers;
    parsed.depth = depth;
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Synthesis generation failed:", error);
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota')) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to generate synthesis" }, { status: 500 });
  }
}
