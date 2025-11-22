"use client";
import {useGameEngine} from "@/components/game-enginge-context";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Dialog, DialogContent, DialogHeader} from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Slider} from "@/components/ui/slider";
import {Label} from "@/components/ui/label";
import {useState, useMemo} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {EventModel} from "@/game/models/event-model";
import {StateModel} from "@/game/models/state-model";

// Seeded random for consistent mock data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate mock chart data
const MOCK_CHART_DATA = Array.from({length: 11}, (_, i) => ({
  year: 2025 + i,
  kapital: 50000 + i * 10000 + seededRandom(42 + i) * 20000,
  lebensqualität: 50 + i * 2 + seededRandom(142 + i) * 10,
  ziel: 50000 + i * 15000,
}));

export default function Simulation() {
  const gameEngine = useGameEngine();
  const state = gameEngine.getState() as StateModel;
  const history = gameEngine.getHistory() as StateModel[];
  const eventHistory = gameEngine.getEventHistory() as EventModel[];
  const currentEvent = (
    gameEngine as unknown as {currentEventResult?: EventModel}
  ).currentEventResult;

  const [savingsRate, setSavingsRate] = useState(
    state?.savingsRateInPercent || 0
  );
  const [showEventDecision, setShowEventDecision] = useState(!!currentEvent);

  // Generate chart data
  const chartData = useMemo(() => {
    if (history.length === 0) {
      return MOCK_CHART_DATA;
    }

    return history.map((s: StateModel, idx: number) => ({
      year: s.year,
      kapital:
        (s.portfolio?.cashInEuro ?? 0) +
        (s.portfolio?.cryptoInEuro ?? 0) +
        (s.portfolio?.etfInEuro ?? 0),
      lebensqualität: s.lifeSatisfactionFrom1To100,
      ziel: 50000 + idx * 15000,
    }));
  }, [history]);

  const portfolioData = useMemo(() => {
    if (!state?.portfolio) {
      return [
        {name: "Cash", value: 30000},
        {name: "Crypto", value: 10000},
        {name: "ETF", value: 20000},
      ];
    }

    return [
      {name: "Cash", value: state.portfolio.cashInEuro ?? 0},
      {name: "Crypto", value: state.portfolio.cryptoInEuro ?? 0},
      {name: "ETF", value: state.portfolio.etfInEuro ?? 0},
    ].filter((item) => item.value > 0);
  }, [state]);

  const COLORS = ["#4ade80", "#f59e0b", "#6366f1"];

  const handleSavingsRateChange = (value: number[]) => {
    setSavingsRate(value[0]);
    // TODO: Update game engine state with new savings rate
  };

  const handleEventDecision = () => {
    // TODO: Process event decision in game engine
    setShowEventDecision(false);
  };

  const totalCapital = portfolioData.reduce((sum, item) => sum + item.value, 0);

  return (
    <main className="grid grid-cols-12 gap-4 p-4 h-screen bg-gray-50">
      {/* Left Panel: Controls */}
      <Card className="col-span-2 p-4 flex flex-col justify-between">
        <div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Savings rate</Label>
              <div className="mt-2 flex items-center gap-2">
                <Slider
                  value={[savingsRate]}
                  onValueChange={handleSavingsRateChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 flex justify-between">
                <span>Fixcosts</span>
                <span className="font-semibold">{savingsRate}%</span>
                <span>Saving</span>
              </div>
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mb-6 bg-black text-white">Actions</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actions</DialogTitle>
              <DialogDescription>
                Decide which action you want to choose next
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => null}>Move</Button>
              <Button onClick={() => null}>Change Occupation</Button>
              <Button onClick={() => null}>Manage Portfolio</Button>
              <Button onClick={() => null}>Take a Loan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Center Panel: Charts */}
      <Card className="col-span-6 p-6 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Simulation</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="lebensqualität"
              stroke="#fbbf24"
              name="Lebensqualität"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="kapital"
              stroke="#10b981"
              name="Kapital"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ziel"
              stroke="#1f2937"
              strokeDasharray="5 5"
              name="Ziel"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Right Panel: Events & Portfolio */}
      <Card className="col-span-4 p-4 flex flex-col gap-4">
        {/* Events Timeline */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Timeline Events</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {eventHistory.length > 0 ? (
              eventHistory.slice(-5).map((event, idx) => (
                <div key={idx} className="text-xs p-2 bg-gray-100 rounded">
                  <p className="font-semibold text-gray-700">
                    {event.eventDescription}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No events yet</p>
            )}
          </div>
        </div>

        {/* Capital Distribution Donut Chart */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-sm mb-2">Capital Chart</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `€${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-600 text-center mt-2">
            <p className="font-semibold">
              Total: €{totalCapital.toLocaleString()}
            </p>
            <div className="mt-1 space-y-1">
              {portfolioData.map((item, idx) => (
                <p key={idx}>
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{backgroundColor: COLORS[idx]}}
                  />
                  {item.name}: €{item.value.toLocaleString()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Event Decision Modal */}
      <Dialog open={showEventDecision} onOpenChange={setShowEventDecision}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event!</DialogTitle>
          </DialogHeader>
          {currentEvent && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">
                {currentEvent.eventDescription}
              </p>
              <p className="text-sm text-gray-600">
                {currentEvent.eventQuestion}
              </p>

              {currentEvent.impact && (
                <div className="bg-blue-50 p-3 rounded text-xs">
                  <p className="font-semibold mb-2">Option 1:</p>
                  <ul className="space-y-1 text-gray-700">
                    {currentEvent.impact.changeInSavingsRateInPercent && (
                      <li>
                        Savings Rate: +
                        {currentEvent.impact.changeInSavingsRateInPercent}%
                      </li>
                    )}
                    {currentEvent.impact.changeInLifeSatisfactionFrom1To100 && (
                      <li>
                        Life Quality:{" "}
                        {currentEvent.impact
                          .changeInLifeSatisfactionFrom1To100 > 0
                          ? "+"
                          : ""}
                        {currentEvent.impact.changeInLifeSatisfactionFrom1To100}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {currentEvent.alternativeImpact && (
                <div className="bg-orange-50 p-3 rounded text-xs">
                  <p className="font-semibold mb-2">Option 2:</p>
                  <ul className="space-y-1 text-gray-700">
                    {currentEvent.alternativeImpact
                      .changeInSavingsRateInPercent && (
                      <li>
                        Savings Rate: +
                        {
                          currentEvent.alternativeImpact
                            .changeInSavingsRateInPercent
                        }
                        %
                      </li>
                    )}
                    {currentEvent.alternativeImpact
                      .changeInLifeSatisfactionFrom1To100 && (
                      <li>
                        Life Quality:{" "}
                        {currentEvent.alternativeImpact
                          .changeInLifeSatisfactionFrom1To100 > 0
                          ? "+"
                          : ""}
                        {
                          currentEvent.alternativeImpact
                            .changeInLifeSatisfactionFrom1To100
                        }
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-500"
                  onClick={handleEventDecision}
                >
                  Option 1
                </Button>
                <Button
                  className="flex-1 bg-orange-500"
                  onClick={handleEventDecision}
                >
                  Option 2
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
