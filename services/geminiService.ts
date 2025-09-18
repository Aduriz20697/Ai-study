import { GoogleGenAI, Type, Chat } from "@google/genai";
import { TUTOR_SYSTEM_INSTRUCTION } from '../constants';
import { QuizQuestion, ChatMessage as AppChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

function getChatInstance(): Chat {
  if (!chat) {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      },
    });
  }
  return chat;
}

export const resetChatInstance = () => {
  chat = null;
};

export const getChatResponseStream = async (message: string) => {
  const chatInstance = getChatInstance();
  try {
    const response = await chatInstance.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Error in getChatResponseStream:", error);
    throw new Error("Failed to get response from AI. Please check your connection or API key.");
  }
};

export const generateQuiz = async (topic: string, numQuestions: number): Promise<QuizQuestion[]> => {
  const prompt = `Based on the following text, generate a quiz with exactly ${numQuestions} questions. Each question should have a clear question and a concise answer.

Text:
---
${topic}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The quiz question."
              },
              answer: {
                type: Type.STRING,
                description: "The answer to the question."
              }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedQuiz = JSON.parse(jsonText) as QuizQuestion[];
    return parsedQuiz;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. The topic might be too short or the AI service is unavailable.");
  }
};
