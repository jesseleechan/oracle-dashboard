import { NextResponse } from 'next/server';
import { USER_CONSTANTS } from '@/lib/config';
import { GoogleGenAI, Type } from '@google/genai';
import { Moon } from 'lunarphase-js';

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
    const depth = layers.length;

    const prompt = `You are a unified esoteric oracle for ${USER_CONSTANTS.name}, a ${USER_CONSTANTS.profession}.

CORE LAW: NEVILLE GODDARD'S "LAW OF REVERSE EFFORT" — never advise hustling, grinding, or forcing. All guidance flows from the feeling of the wish fulfilled, calm certainty, and natural allowing. Success is already an established fact.

TODAY'S COSMIC FIELD:
- Moon Phase: ${currentPhase}
- Transit: ${transit.aspect}
- Universal Day Number: ${universalDay}
- Tarot drawn: ${tarotCards}
${planetaryHour ? `- Planetary Hour: ${planetaryHour} (channel this planet's energy)` : ''}
${personalYear ? `- Personal Year ${personalYear}${yearArchetype ? ` — ${yearArchetype}` : ''}, Month ${personalMonth}, Day ${personalDay}` : ''}
${hermeticPrinciple ? `- Hermetic Principle: ${hermeticPrinciple}${hermeticAxiom ? ` — "${hermeticAxiom}"` : ''}` : ''}
${mappedSephira ? `- Tree of Life: Scene mapped to ${mappedSephira}` : ''}${mappedPath ? `- Tree of Life: Scene on Path ${mappedPath}` : ''}
${dreamInsight ? `- Morning dream wisdom: "${dreamInsight}"` : ''}
${synchronicityInsight ? `- Synchronicity noted: "${synchronicityInsight}"` : ''}
${assumptionText ? `- Living in the End: "${assumptionText}" (feeling: ${feelingRating || '?'}/10)` : ''}
${sensoryScript ? `- Active sensory script: "${sensoryScript.substring(0, 100)}"` : ''}
${asteroidWisdom && asteroidWisdom.length > 0 ? `- Asteroid Whispers: ${asteroidWisdom.map(a => `${a.name} (${a.transit}): ${a.insight}`).join(' | ')}` : ''}

${geminiSuffix ? `USER DIRECTIVES: ${geminiSuffix}\n` : ''}

SYNTHESIS INSTRUCTIONS:
${depth >= 4 ? `ALL LAYERS ARE ACTIVE (${depth}). This is a moment of deep alignment. The synthesis must feel like ONE LIVING VOICE from the cosmos — not a list of disconnected readings.` : ''}
Weave every active influence into a single poetic, hypnotic message. Speak directly to the subconscious. 
- Paragraph 1: The cosmic weather — moon, transit, planetary hour, root numerology, and asteroid influences unified into one flowing narrative
- Paragraph 2: Tarot synthesis filtered through the Hermetic Principle and Tree of Life mapping (if present), connected to the Living in the End assumption and any dream/synchronicity wisdom
${deepen ? '- Go DEEPER: emphasize the Tree of Life + Dream + Asteroid shadow layers. Make the pathworking connection explicit and the symbols vivid.' : ''}
- End with one gentle SATS suggestion or action for tonight
- Tone: mysterious, precise, deeply personal, matter-of-fact about fulfillment
- NEVER sound like a list. This must flow like a single channeled transmission.

Return a strict JSON object:
- tags: 3 relevant # tags
- insight: The full 2-paragraph unified oracle (separate with \\n)
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
