// test-engine.ts
import dotenv from "dotenv";
// WICHTIG: Passe diesen Pfad an, je nachdem wo du JobEngine gespeichert hast!
// Wenn es in 'lib' liegt: import { JobEngine } from "./lib/job-engine";
// Wenn es in 'services' liegt: import { JobEngine } from "./services/job-engine";
import { JobEngine } from "./game/engines/job-engine";

// 1. Umgebungsvariablen laden (Damit der API Key gefunden wird)
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🚀 Starte JobEngine Test...");

  try {
    // 2. Klasse instanziieren
    const engine = new JobEngine();

    const jobWishes = [
      "Senior Java Developer",
      "Pizza Baker in Munich",
      "Astronaut"
    ];

    for (const wish of jobWishes) {
      console.log(`\n----------------------------------`);
      console.log(`🔍 Analysiere: "${wish}"...`);
      
      // 3. Die Methode aufrufen (WICHTIG: mit await!)
      const result = await engine.handleNewJobWish(wish);

      // 4. Ergebnis anzeigen
      console.log("✅ Ergebnis:");
      console.log(result);
    }

  } catch (error) {
    console.error("❌ Ein Fehler ist aufgetreten:", error);
  }
}

main();