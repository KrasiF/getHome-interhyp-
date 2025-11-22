"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useGameEngine} from "@/components/game-engine-context";
import {OccupationModel} from "@/game/models/occupation-model";
import {UserInputModel} from "@/game/models/user-input-model";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";

export default function FindOccupation() {
  const router = useRouter();
  const {engine: gameEngine} = useGameEngine();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OccupationModel | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const occ = await gameEngine.requestNewOccupation(query);
      // requestNewOccupation returns a single OccupationModel
      setResult(occ || null);
    } catch (err) {
      console.error("requestNewOccupation failed:", err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;

    const userInput: UserInputModel = {
      newOccupationModel: {
        occupationTitle: result.occupationTitle || "",
        occupationDescription: result.occupationDescription || "",
        yearlySalaryInEuro: result.yearlySalaryInEuro ?? 0,
        stressLevelFrom0To100: result.stressLevelFrom0To100 ?? 50,
      },
      newPortfolioModel: null,
      newLivingModel: null,
      newSavingsRateInPercent: null,
    };

    try {
      gameEngine.decideActions(userInput);
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
          <Label className="font-semibold">Describe the occupation</Label>
          <Input
            placeholder="e.g. Senior Software Engineer, product manager"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading || !query}>
            {loading ? "Searching..." : "Request Occupation"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setResult(null);
            }}
          >
            Reset
          </Button>
        </div>

        <div>
          {result ? (
            <div className="p-4 border rounded">
              <p className="font-semibold">{result.occupationTitle}</p>
              <p className="text-sm text-gray-600">
                {result.occupationDescription}
              </p>
              <p className="text-sm text-gray-600">
                Salary: €{result.yearlySalaryInEuro?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Stress: {result.stressLevelFrom0To100}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No occupation suggested yet</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!result}>
            Apply Occupation
          </Button>
        </div>
      </Card>
    </main>
  );
}
