import { GoogleGenAI } from "@google/genai";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface ABCLog {
  antecedent: string;
  behavior: string;
  consequence: string;
  timestamp: string;
  analysis?: string;
}

export async function analyzeBehavior(log: ABCLog, childProfile: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyzuj následující incident chování pomocí metody ABC pro dítě s tímto profilem: ${childProfile}.
    
    Incident:
    A (Antecedent): ${log.antecedent}
    B (Behavior): ${log.behavior}
    C (Consequence): ${log.consequence}
    
    Poskytni stručnou analýzu, možné spouštěče a doporučení pro příště. Odpovídej v češtině jako Synthesis Intelligence.`,
    config: {
      systemInstruction: "Jsi Synthesis Intelligence (SI), autonomní expert a empatický průvodce vytvořený Studiem Synthesis. Pomáháš rodičům dětí na PAS analyticky nahlížet na chování jejich dětí. Používej metodu ABC (Antecedent-Behavior-Consequence).",
    }
  });

  return response.text;
}

export async function getCrisisAdvice(situation: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Uživatel popisuje krizovou situaci: ${situation}. 
    Poskytni okamžité, stručné a klidné kroky pro zvládnutí situace (SOS režim). 
    1. Bezpečí, 2. Redukce podnětů, 3. Dech.`,
    config: {
      systemInstruction: "Jsi Synthesis Intelligence v SOS režimu. Maximální stručnost, klidný tón, jasné kroky. Žádné dlouhé vysvětlování. Prioritou je bezpečí a deeskalace.",
    }
  });

  return response.text;
}
