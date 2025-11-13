
import { GoogleGenAI, Modality } from "@google/genai";
import { FALLBACK_QUOTES } from '../constants';

const getAi = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable is not set. Using fallback data.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateQuote = async (topic: string): Promise<string> => {
    const ai = getAi();
    if (!ai) {
        const filteredQuotes = FALLBACK_QUOTES.filter(q => q.category.toLowerCase() === topic.toLowerCase());
        const quotePool = filteredQuotes.length > 0 ? filteredQuotes : FALLBACK_QUOTES;
        return quotePool[Math.floor(Math.random() * quotePool.length)].quote;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, powerful quote about ${topic}. The quote should be inspiring and concise. Maximum 25 words.`,
        });
        return response.text.replace(/"/g, ''); // Remove quotes from the response
    } catch (error) {
        console.error("Error generating quote:", error);
        return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)].quote;
    }
};

export const generateBackground = async (prompt: string): Promise<string | null> => {
    const ai = getAi();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Generate a beautiful, abstract, visually pleasing background image based on the theme: "${prompt}". The image should be suitable as a backdrop for text, with subtle patterns or textures. Avoid clear objects or distracting elements.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating background:", error);
        return null;
    }
};
