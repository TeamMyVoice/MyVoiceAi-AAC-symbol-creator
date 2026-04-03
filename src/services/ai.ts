import { GoogleGenAI } from "@google/genai";
import { CharacterAttributes } from "../types";

export async function generateIconImage(attributes: CharacterAttributes, action: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  
  // Create a new instance right before making an API call to ensure it uses the most up-to-date key
  const ai = new GoogleGenAI({ apiKey });
  
  const hairDesc = attributes.hairLength === 'Bald' ? 'bald head' : `${attributes.hairLength} ${attributes.hairColor} hair`;
  
  const prompt = `A high-quality AAC symbol icon of a ${attributes.age} ${attributes.gender} with a ${attributes.bodySize.toLowerCase()} body type, ${attributes.skinColor} skin, ${hairDesc}, ${attributes.eyeColor} eyes, wearing a ${attributes.clothesColor} shirt. The character is ${action}. Style of minimalistic flat vector illustration style, thick clean outlines, simple solid colors, centered on a plain white background, isolated, professional clinical look, no shading or gradients, high contrast, symbol stix style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No candidates returned from the model");
  }

  const parts = response.candidates[0].content.parts;
  if (!parts) {
    throw new Error("No parts returned from the model");
  }

  for (const part of parts) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      const mimeType = part.inlineData.mimeType || 'image/png';
      return `data:${mimeType};base64,${base64EncodeString}`;
    }
  }

  throw new Error("No image data found in the response");
}
