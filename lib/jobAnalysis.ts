// lib/jobAnalysis.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface JobMetrics {
  estimatedSalary: number;
  stressLevel: number;
  explanation: string;
}

export async function calculateJobMetrics(jobTitle: string): Promise<JobMetrics> {
  
  // Load API Key from environment variables
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing! Please provide it in env.local ");
  }


  const genAI = new GoogleGenerativeAI(apiKey);

  // Define agent
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: `
      You are an HR expert for the German market. 
      
      Task:
      1. Estimate the annual salary in EUR (estimatedSalary).
      2. Estimate the stress level on a scale of 1-100 (stressLevel).
      3. Provide a short "explanation" (max 1 sentence). Give a reason or an interesting fact why the stress or salary is at this level (e.g., high responsibility, shortage of skilled workers, emotional load).

      Constraints:
      - Return ONLY integer numbers for salary and stress. No decimals, no units.
      - Respond ONLY with a JSON object. No Markdown formatting`,
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `Analyse this job title: "${jobTitle}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const data = JSON.parse(text);

    return {
      estimatedSalary: Math.round(Number(data.estimatedSalary) || 0),
      stressLevel: Math.round(Number(data.stressLevel) || 0),
      explanation: data.explanation || "No explanation available.",
    };
  } catch (error) {
    console.error("Error from Gemini API:", error);
    
    return { estimatedSalary: 0, 
      stressLevel: 0, 
      explanation: "Sorry. Could not analyze job data."};
  }
}