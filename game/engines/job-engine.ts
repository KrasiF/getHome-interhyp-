import { OccupationModel } from "../models/occupation-model";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface JobEngineInterface {
    handleNewJobWish(job_description: string): Promise<OccupationModel>;
}

export class JobEngine implements JobEngineInterface {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing! Please provide it in .env.local");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    public async handleNewJobWish(job_description: string): Promise<OccupationModel> {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
                You are an HR expert for the German market. 
                
                Task:
                1. Estimate the annual salary in EUR (yearlySalaryInEuro).
                2. Estimate the stress level on a scale of 1-100 (stressLevelFrom0To100).
                3. Provide a short description/explanation (occupationDescription) - max 1 sentence explaining the rating.

                Constraints:
                - Return ONLY integer numbers for salary and stress.
                - Respond ONLY with a JSON object matching the target fields.
            `,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Analyse this job title: "${job_description}"`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const data = JSON.parse(text);

            return {
                occupationTitle: job_description, 
                occupationDescription: data.occupationDescription || "No description available.",
                yearlySalaryInEuro: Math.round(Number(data.yearlySalaryInEuro) || 0),
                stressLevelFrom0To100: Math.round(Number(data.stressLevelFrom0To100) || 0)
            };

        } catch (error) {
            console.error("Error inside JobEngine:", error);
            
            return {
                occupationTitle: job_description,
                occupationDescription: "Error analysing job data.",
                yearlySalaryInEuro: 0,
                stressLevelFrom0To100: 0
            };
        }
    }
}
