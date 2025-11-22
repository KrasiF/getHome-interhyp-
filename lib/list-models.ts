// lib/list-models.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return console.error("Kein API Key!");

  // Wir nutzen hier direkt die REST API Logik über fetch, 
  // da das SDK listModels manchmal versteckt.
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Verfügbare Modelle:");
    data.models.forEach((m: any) => {
        // Wir filtern nur die, die Content generieren können
        if(m.supportedGenerationMethods.includes("generateContent")) {
            console.log(` - ${m.name.replace("models/", "")}`);
        }
    });
  } catch (e) {
    console.error(e);
  }
}

main();