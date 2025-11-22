// Diese Programm dient nur zum testen von jobAnalysis.ts
// Zum Ausführen: npx tsx lib/test-job.ts

// lib/test-job.ts
import { calculateJobMetrics } from "./jobAnalysis";
import dotenv from "dotenv";

// Wir laden die Env-Variablen
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.error("FEHLER beim Laden der .env.local Datei:", result.error);
} else {
  console.log("Dotenv geladen. Inhalt:", result.parsed); 
  // ^ Das zeigt uns, ob der Key wirklich gelesen wurde!
}

const testTitles = [
  "Junior Python Developer", 
];

async function runTests() {
  console.log("--- Connecting to Gemini API... ---");

  for (const title of testTitles) {
    console.log(`Analyzing: "${title}"...`);
    try {
      const metrics = await calculateJobMetrics(title);
      console.log(` -> Salary: ${metrics.estimatedSalary} €`);
      console.log(` -> Stress: ${metrics.stressLevel}/100`);
      console.log(` -> Note:   ${metrics.explanation}`); // New line
    } catch (e: any) {
      // HIER IST DIE ÄNDERUNG: Wir geben den echten Fehler aus!
      console.error("!!! FEHLER DETAILS !!!");
      console.error(e.message);
      if (e.response) {
         console.error("API Antwort:", await e.response.text());
      }
    }
    console.log("-------------------------------");
  }
}

runTests();