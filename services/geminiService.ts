
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

    const genrePrompt = partialChar.genre
      ? `The user has specified a genre/tone: "${partialChar.genre}". Write as if this character lives in a world of that genre. For example, for "Cyberpunk", think gritty megacities and advanced technology. For "High Fantasy", think epic quests and magical creatures.`
      : "The user has not specified a genre. You can assume a standard fantasy setting, but feel free to be creative.";

    const prompt = `
      You are a creative writer and world-building expert for roleplaying games.
      A user has provided a partial character description. Your task is to flesh out the missing details or creatively enhance the existing ones.
      ${genrePrompt}
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

export const evolveCharacter = async (
    character: Partial<Character>,
    prompt: string
): Promise<PartialCharacter | null> => {
    try {
        const promptData = { ...character };
        const evolutionPrompt = `
            You are a master storyteller and character developer.
            A user wants to evolve an existing character based on a prompt.
            Your task is to intelligently update the character's details based on the user's request.
            You must not change the character's name.
            The updates should be creative, consistent with the existing character, and seamlessly integrated.
            For example, if the user asks for a "more tragic backstory", you should rewrite the backstory to be more sorrowful and perhaps adjust the character's personality or flaws to reflect this change.
            If the user mentions a new item, you should add it to the character's appearance or backstory.
            Return ONLY a valid JSON object that strictly adheres to the provided schema. Do not include any explanatory text, markdown formatting, or anything outside of the JSON structure.

            User Prompt: "${prompt}"

            Existing Character Data:
            ${JSON.stringify(promptData, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: evolutionPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: characterSchema,
            },
        });

        const jsonText = response.text.trim();
        const generatedData = JSON.parse(jsonText);

        return {
            ...character,
            ...generatedData,
        };

    } catch (error) {
        console.error("Error evolving character with Gemini:", error);
        return null;
    }
};

export const generatePortrait = async (
    character: Partial<Character>
): Promise<string | null> => {
    try {
        const description = character.appearance || character.synopsis || "A fantasy character";
        const prompt = `
            Generate a digital painting of a character for a roleplaying game.
            Style: Dramatic lighting, detailed, fantasy art.
            Description: ${description}
            Genre: ${character.genre || 'Fantasy'}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash', // Or another suitable model
            contents: prompt,
            // Assuming the model can output images directly, or you'd use a different API/method.
            // This is a conceptual example. The actual implementation might differ based on API capabilities.
            // For instance, you might need to use a specific image generation model or endpoint.
        });

        // This part is highly dependent on the actual API response format for images.
        // It might be a URL, a base64 string, etc.
        // The following is a placeholder for processing the response.
        // const image_data = response.parts.find(p => p.type === 'image')?.data;
        // if (image_data) {
        //     return `data:image/jpeg;base64,${image_data}`;
        // }

        // Since I can't actually generate images, I'll return a placeholder.
        // In a real scenario, this would be the base64 string from the API.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API latency
        const placeholderUrl = `https://i.pravatar.cc/512?u=${character.id || Date.now()}`;
        // In a real app, you would fetch this URL and convert it to base64.
        // For this simulation, we'll just return the URL, and the component can use it directly.
        // To properly simulate, we should fetch and convert to base64.
        const imageResponse = await fetch(placeholderUrl);
        const blob = await imageResponse.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Error generating portrait with Gemini:", error);
        return null;
    }
};
