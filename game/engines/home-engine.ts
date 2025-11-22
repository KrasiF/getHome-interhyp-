import { LivingModel } from "../models/living-model";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface HomeEngineInterface {
    handleNewHomeWish(home_desc: string): Promise<LivingModel[]>;
}

export class HomeEngine implements HomeEngineInterface {
    private genAI: GoogleGenerativeAI;

   constructor() {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing! Please provide it in .env.local");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    public async handleNewHomeWish(home_desc: string): Promise<LivingModel[]> {
        // Generate multiple home choices based on description
        return await this.generateHomeOptions(home_desc);
    }

    private async generateHomeOptions(description: string): Promise<LivingModel[]> {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
                You are a Real Estate Expert for the German market.
                
                Task:
                Based on the user's description, generate exactly 3 different housing options.
                The options should be realistic for Germany.
                
                Variation:
                - Option 1: Slightly cheaper, maybe smaller or different location.
                - Option 2: Perfect match to description.
                - Option 3: Slightly more expensive/premium, larger or better location.

                Output Structure (JSON Array):
                [
                    {
                        "yearlyRentInEuro": number (calculate monthly * 12),
                        "zip": string (valid 5-digit German postal code),
                        "sizeInSquareMeter": number (integer)
                    }
                ]

                Constraints:
                - Respond ONLY with a raw JSON Array. 
                - No Markdown formatting.
            `,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Find homes for this request: "${description}"`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const data = JSON.parse(text);

            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    yearlyRentInEuro: Math.round(Number(item.yearlyRentInEuro) || 0),
                    zip: String(item.zip || "00000"), 
                    sizeInSquareMeter: Math.round(Number(item.sizeInSquareMeter) || 0)
                }));
            }

            return [];

        } catch (error) {
            console.error("Error generating homes:", error);
            return [];
        }
    }
}
