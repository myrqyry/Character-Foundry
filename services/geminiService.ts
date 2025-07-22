
import { GoogleGenAI, Type } from "@google/genai";
import { Character, PartialCharacter } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error.
  // For this context, we assume the key is always present.
  console.error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const characterSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The character's full name. If provided, keep it, otherwise invent one." },
        title: { type: Type.STRING, description: "A title or epithet for the character, like 'The Wanderer' or 'Archmage of the Crimson Circle'." },
        synopsis: { type: Type.STRING, description: "A one-paragraph summary of the character's essence and primary conflict." },
        personality: { type: Type.STRING, description: "A detailed description of the character's personality traits, mannerisms, and temperament." },
        flaws: { type: Type.STRING, description: "Describe the character's significant weaknesses, fears, or vices." },
        strengths: { type: Type.STRING, description: "Describe the character's key strengths, skills, or virtues." },
        appearance: { type: Type.STRING, description: "A rich, detailed description of the character's physical appearance, including clothing and posture." },
        backstory: { type: Type.STRING, description: "A compelling backstory outlining the character's history and motivations." },
    },
};

export const fleshOutCharacter = async (
  partialChar: Partial<Character>
): Promise<PartialCharacter | null> => {
  try {
    // Create a new object for the prompt, omitting large media fields to be efficient.
    const promptData = {
        name: partialChar.name,
        title: partialChar.title,
        synopsis: partialChar.synopsis,
        personality: partialChar.personality,
        flaws: partialChar.flaws,
        strengths: partialChar.strengths,
        appearance: partialChar.appearance,
        backstory: partialChar.backstory,
    };

    const prompt = `
      You are a creative writer and world-building expert for fantasy roleplaying games.
      A user has provided a partial character description. Your task is to flesh out the missing details or creatively enhance the existing ones.
      Please generate a complete character profile based on the provided data.
      If a field is empty, create a compelling entry for it. If a field has content, you can either use it as inspiration or subtly improve it.
      Return ONLY a valid JSON object that strictly adheres to the provided schema. Do not include any explanatory text, markdown formatting, or anything outside of the JSON structure.

      Partial Character Data:
      ${JSON.stringify(promptData, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: characterSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const generatedData = JSON.parse(jsonText);

    // Ensure all fields from the schema are present, even if empty strings.
    // Merge generated text data with the original media data.
    const fullCharacterData: PartialCharacter = {
        name: generatedData.name || '',
        title: generatedData.title || '',
        synopsis: generatedData.synopsis || '',
        personality: generatedData.personality || '',
        flaws: generatedData.flaws || '',
        strengths: generatedData.strengths || '',
        appearance: generatedData.appearance || '',
        backstory: generatedData.backstory || '',
        portraitBase64: partialChar.portraitBase64 || null,
        voiceSampleBase64: partialChar.voiceSampleBase64 || null,
    };

    return fullCharacterData;

  } catch (error) {
    console.error("Error generating character details with Gemini:", error);
    return null;
  }
};
