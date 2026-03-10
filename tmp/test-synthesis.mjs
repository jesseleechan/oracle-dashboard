import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found.");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const contextString = `
- Moon Phase: Waning Crescent 🌒
- Daily Transit: Moon Trine Venus
- Universal Day Number: 7
- Tarot Cards Drawn: The High Priestess, Four of Cups, Ace of Wands
- Planetary Hour: Jupiter
- Personal Numerology: Year 9 (The Hermit), Month 8, Day 1
- Hermetic Principle: The Principle of Rhythm — "Everything flows, out and in; everything has its tides."
- Tree of Life Mapping: Sephira: Netzach, Path: 29
- Morning Dream Wisdom: "I dreamt of climbing a spiral staircase that never ended, but I felt weightless."
- Living in the End (Assumption): "I am fully financially independent and doing the work I love." (Feeling intensity: 8/10)
- Asteroid Whispers: Chiron (Trine Sun): Focus on healing old wounds regarding self-worth.
- Fixed Stars & Lunar Mansion: Mansion of Al Taj (The Crown). Royal Star Aldebaran active.
- Saved Macro-Pattern to Integrate: "Every time you draw cups, you experience a breakthrough in relationship communication."
`;

  const layers = ['planetary', 'numerology', 'hermetic', 'tree', 'dream', 'assumption', 'stars', 'asteroid', 'pattern'];
  const depth = layers.length;

  const prompt = `You are a unified esoteric oracle for Jesse Chan, a Creative Developer.

CORE LAW: NEVILLE GODDARD'S "LAW OF REVERSE EFFORT" — never advise hustling, grinding, or forcing. All guidance flows from the feeling of the wish fulfilled, calm certainty, and natural allowing. Success is already an established fact.

TODAY'S COSMIC FIELD:
${contextString}

SYNTHESIS PARADIGM:
ALL LAYERS ARE ACTIVE (${depth}). This is a moment of deep, total alignment. The synthesis must reflect this profound esoteric resonance.
Weave EVERY active influence into a SINGLE, hypnotic, continuously flowing prose message. ABSOLUTELY NO BULLET POINTS. NO NUMBERED LISTS. NO SECTION HEADINGS. Do not list the transits back to me. Speak directly to the soul and subconscious, translating all these technical astrological, numerological, and qabalistic details into a pure emotional and spiritual landscape.

Structure exactly 2 paragraphs:
Paragraph 1: The Cosmic Weather. Synthesize the moon, transit, hour, numerology, fixed stars, and asteroids into a lush, atmospheric description of today's energy.
Paragraph 2: The Oracle's Command. Filter the Tarot through the Hermetic Principle, Tree of Life, and Dream/Synchronicity wisdom. Connect this deeply to the Living in the End assumption. 
- Go DEEPER: emphasize shadow layers, ancestral lessons, and unseen orchestrations pulling the wish into physical reality.

End the second paragraph with a natural, gentle command for tonight's SATS (State Akin to Sleep). 
Tone: lyrical, mysterious, intimately knowing, grounded in absolute manifestation certainty.

Return a strict JSON object:
- tags: 3 relevant # tags
- insight: The full 2-paragraph flowing prose oracle (separate paragraphs with exactly one \\n\\n, DO NOT use bullet points or dashes)
- energyRatings: 8 objects scoring { category, rating }
`;

  console.log("Sending prompt to Gemini...");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            insight: { type: Type.STRING },
            energyRatings: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, rating: { type: Type.STRING } } }
            }
          }
        }
      }
    });
    
    console.log("RESPONSE RECEIVED:\n-----------------");
    const parsed = JSON.parse(response.text);
    console.log(parsed.insight);
  } catch (error) {
    console.error("Test failed", error);
  }
}

runTest();
