import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse, Mood } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStory = async (prompt: string, mood: Mood): Promise<StoryResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Du är en varm och inlevelsefull sagoberättare för barn.
      Skriv en godnattsaga på svenska.
      Sagan ska ta ungefär 5 minuter att läsa högt.
      
      Ämne/Handling: ${prompt}
      Känsla: ${mood}
      
      Använd ett barnvänligt, rikt och målande språk. Dela upp texten i luftiga stycken för enkel läsning.
      Inkludera en sensmoral eller lärdom om det passar.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "En kreativ och lockande titel på sagan.",
            },
            content: {
              type: Type.STRING,
              description: "Själva sagan, formaterad med \n\n för nya stycken.",
            },
            moral: {
              type: Type.STRING,
              description: "En kort mening om vad vi lär oss av sagan (valfritt).",
            },
          },
          required: ["title", "content"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Inget svar från sago-fen.");
    }

    const jsonResponse = JSON.parse(text) as StoryResponse;
    return jsonResponse;

  } catch (error) {
    console.error("Fel vid generering av saga:", error);
    throw new Error("Ojdå! Sago-fen tappade bort sin trollstav. Försök igen!");
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
      throw new Error("Kunde inte skapa ljud.");
    }
    return audioData;
  } catch (error) {
    console.error("TTS Error:", error);
    throw new Error("Kunde inte läsa upp sagan just nu.");
  }
};