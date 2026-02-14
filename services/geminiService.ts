
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeAdmissions(prompt: string, contextData?: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: [
          {
            role: 'user',
            parts: [
              { text: `CONTEXT DATA:\n${contextData || 'No specific data provided yet.'}` },
              { text: prompt }
            ]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.7,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateStrategicReport(category: string, dataBlob: string) {
    const ai = this.getAI();
    const prompt = `Perform a deep diagnostic analysis for the ${category} category based on the provided data files. Focus on conversion optimization, ROI, and risk mitigation. Follow the DAAP output standards strictly.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }, { text: `DATA:\n${dataBlob}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    
    return response.text;
  }
}

export const gemini = new GeminiService();
