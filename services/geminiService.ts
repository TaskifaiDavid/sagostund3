import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, Mood, Language } from "../types";
import { translations } from "../utils/localization";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please configure it in your environment variables (Vercel Settings or .env.local)");
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAiClient();

export const generateStory = async (prompt: string, mood: Mood, language: Language): Promise<StoryResponse> => {
  try {
    // Define language-specific instructions
    const isSv = language === 'sv';
    
    const systemInstructionSv = `Du är en varm och inlevelsefull sagoberättare för barn.
      Skriv en godnattsaga på svenska.
      Sagan ska ta ungefär 5 minuter att läsa högt.
      Använd ett barnvänligt, rikt och målande språk. Dela upp texten i luftiga stycken för enkel läsning.
      Inkludera en sensmoral eller lärdom om det passar.`;

    const systemInstructionEn = `You are a warm and expressive storyteller for children.
      Write a bedtime story in English.
      The story should take about 5 minutes to read aloud.
      Use child-friendly, rich, and descriptive language. Split the text into airy paragraphs for easy reading.
      Include a moral or lesson if it fits.`;

    const moodLabel = translations[language].moods[mood];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      ${isSv ? systemInstructionSv : systemInstructionEn}
      
      ${isSv ? 'Ämne/Handling' : 'Subject/Plot'}: ${prompt}
      ${isSv ? 'Känsla' : 'Mood'}: ${moodLabel}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: isSv ? "En kreativ och lockande titel på sagan." : "A creative and engaging title for the story.",
            },
            content: {
              type: Type.STRING,
              description: isSv ? "Själva sagan, formaterad med \n\n för nya stycken." : "The story content, formatted with \n\n for new paragraphs.",
            },
            moral: {
              type: Type.STRING,
              description: isSv ? "En kort mening om vad vi lär oss av sagan (valfritt)." : "A short sentence about what we learn from the story (optional).",
            },
          },
          required: ["title", "content"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error(isSv ? "Inget svar från sago-fen." : "No response from the story fairy.");
    }

    const jsonResponse = JSON.parse(text) as StoryResponse;
    return jsonResponse;

  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error(language === 'sv' 
      ? "Ojdå! Sago-fen tappade bort sin trollstav. Försök igen!" 
      : "Oops! The Story Fairy lost her wand. Try again!");
  }
};

export const generateStorySpeech = async (text: string, voiceName: string = 'Zephyr'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error("Could not generate audio.");
    }
    return audioData;
  } catch (error) {
    console.error("TTS Error:", error);
    throw new Error("Could not read the story right now.");
  }
};