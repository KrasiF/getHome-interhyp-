"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useGameEngine} from "@/components/game-engine-context";
import {LivingModel} from "@/game/models/living-model";
import {UserInputModel} from "@/game/models/user-input-model";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";

export default function FindHomes() {
  const router = useRouter();
  const {engine: gameEngine} = useGameEngine();

  const [homeDescription, setHomeDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LivingModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const homes = await gameEngine.requestNewHomes(homeDescription);
      setResults(homes || []);
      setSelectedIndex(homes && homes.length > 0 ? 0 : null);
    } catch (err) {
      console.error("requestNewHomes failed:", err);
      setResults([]);
      setSelectedIndex(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
  };

  const handleConfirmMove = () => {
    if (selectedIndex === null) return;
    const chosen = results[selectedIndex];
    if (!chosen) return;

    // Build UserInputModel with only newLivingModel filled
    const userInput = {
      newOccupationModel: null,
      newPortfolioModel: null,
      newLivingModel: {
        name: String(chosen.name ?? ""),
        zip: String(chosen.zip ?? ""),
        yearlyRentInEuro: Number(chosen.yearlyRentInEuro ?? 0) || 0,
        sizeInSquareMeter: Number(chosen.sizeInSquareMeter ?? 0) || 0,
      },
      newSavingsRateInPercent: null,
    };

    try {
      gameEngine.decideActions(userInput as UserInputModel);
    } catch (err) {
      console.error("decideActions failed:", err);
    }

    router.push("/simulation");
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        Back
      </Button>

      <Card className="p-6 space-y-4">
        <div>
          <Label className="font-semibold">Describe the home you want</Label>
          <Input
            placeholder="e.g. 3-room apartment, central Berlin, ~80m²"
            value={homeDescription}
            onChange={(e) => setHomeDescription(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading || !homeDescription}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setHomeDescription("");
              setResults([]);
              setSelectedIndex(null);
            }}
          >
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No results yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedIndex === idx
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSelect(idx)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-sm text-gray-600">
                        ZIP: {r.zip ?? "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {r.sizeInSquareMeter ?? "-"} m²
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        €
                        {Number(
                          Math.round(r.yearlyRentInEuro ?? 0) / 12
                        ).toLocaleString("de-DE")}{" "}
                        per month
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleConfirmMove} disabled={selectedIndex === null}>
            Move
          </Button>
        </div>
      </Card>
    </main>
  );
}
