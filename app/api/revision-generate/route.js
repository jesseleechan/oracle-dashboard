import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const { originalScene, hermeticPrinciple, personalYear, planetaryHour, asteroidInsight, starsInsight, patternInsight } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        revisedScene: originalScene.replace(/wanted|wished|hoped/gi, 'naturally have')
          + ' — It is done. I am grateful.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Neville Goddard revision master. The user experienced this scene and wants to revise it so that the wish is already fulfilled:

ORIGINAL SCENE: "${originalScene}"

${hermeticPrinciple ? `Today's Hermetic Principle: ${hermeticPrinciple}` : ''}
${personalYear ? `Personal Year: ${personalYear}` : ''}
${planetaryHour ? `Current Planetary Hour: ${planetaryHour}` : ''}
${asteroidInsight ? `Asteroid Shadow Influence: ${asteroidInsight} (Use this shadow/healing wisdom to reframe the friction)` : ''}
${starsInsight ? `Fixed Star/Lunar Mansion Influence: ${starsInsight} (Channel this ancient stellar power to anchor the wish fulfilled)` : ''}
${patternInsight ? `pinned Oracle MACRO-PATTERN: "${patternInsight}" (Reweave the scene's friction by grounding it strictly in the assumption provided by this pattern.)` : ''}

REWRITE this scene in first person, present tense, as if the desired outcome has ALREADY happened naturally. Apply Neville Goddard's revision technique:
- Replace friction/resistance with ease and naturalness
- Use sensory details (what you see, hear, feel)
- Make it feel mundane and matter-of-fact — NOT excited or grasping
- Keep the emotional tone of calm gratitude and quiet knowing
${hermeticPrinciple ? `- Subtly weave in the energy of the Hermetic Principle of ${hermeticPrinciple}` : ''}
- Keep it to 2-4 sentences maximum
- Do NOT explain the technique or add any commentary, ONLY the revised scene

Return ONLY the revised scene text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    const text = response.text?.trim() || "It is already done. I rest in the naturalness of the fulfilled state.";

    return NextResponse.json({ revisedScene: text });
  } catch (e) {
    console.error("Revision generation failed:", e);
    return NextResponse.json({
      revisedScene: "The scene is already revised in imagination. I rest in the naturalness of the wish fulfilled."
    });
  }
}
