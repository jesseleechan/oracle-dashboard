import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SENSE_MAP = {
  smell: { label: 'Smell', prompt: 'olfactory sensations — specific scents, aromas, the air quality' },
  touch: { label: 'Touch', prompt: 'tactile sensations — textures, temperature, pressure, physical feelings' },
  hearing: { label: 'Hearing', prompt: 'auditory sensations — specific sounds, voices, ambient noise, music' },
  taste: { label: 'Taste', prompt: 'gustatory sensations — specific flavors, textures in the mouth, the act of savoring' },
  sight: { label: 'Sight', prompt: 'visual sensations — colors, light quality, spatial details, what you see in vivid clarity' }
};

export async function POST(request) {
  try {
    const { scene, sense, planetaryHour, hermeticPrinciple, personalYear } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const senseInfo = SENSE_MAP[sense] || SENSE_MAP.sight;

    if (!apiKey) {
      return NextResponse.json({
        sensoryText: `I notice the ${senseInfo.label.toLowerCase()} of this moment — it is natural, it is real, it is already mine.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Neville Goddard sensory imagination master using the "Nosey Technique" — expanding scenes through one specific sense to make them vivid and real to the subconscious.

SCENE: "${scene}"

EXPAND this scene into a rich 3-5 sentence sensory description focused ONLY on ${senseInfo.prompt}.

Rules:
- First person, present tense
- Already fulfilled — this is happening NOW, it is mundane and natural
- Deeply specific sensory details (not vague)
- Feeling-focused: the sensation confirms the wish is real
- Calm, matter-of-fact tone — no excitement or grasping
${planetaryHour ? `- Subtly channel ${planetaryHour} planetary hour energy` : ''}
${hermeticPrinciple ? `- Let the Hermetic Principle of ${hermeticPrinciple} inform the perspective` : ''}
- Do NOT explain the technique or add commentary
- Return ONLY the sensory description text`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || `The ${senseInfo.label.toLowerCase()} of this fulfilled moment washes over me naturally, confirming what I already know.`;

    return NextResponse.json({ sensoryText: text });
  } catch (e) {
    console.error("Sensory prompt failed:", e);
    return NextResponse.json({
      sensoryText: "Every sense confirms it. This is real. This is now. I rest in the naturalness of it."
    });
  }
}
