"use client";
import {useGameEngine} from "@/components/game-engine-context";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
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
  ReferenceLine,
} from "recharts";
import {EventModel} from "@/game/models/event-model";
import {StateModel} from "@/game/models/state-model";
import {useRouter} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Simulation() {
  const router = useRouter();
  const {engine: gameEngine, triggerUpdate} = useGameEngine();
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

  const currentYear = state?.year || new Date().getFullYear();

  const handleAdvanceYear = () => {
    gameEngine.decideActions({
      newOccupationModel: null,
      newPortfolioModel: null,
      newLivingModel: null,
      newSavingsRateInPercent: savingsRate
    });
    console.log(gameEngine.runLoop());
    triggerUpdate();
    const updatedEvent = (
      gameEngine as unknown as {currentEventResult?: EventModel}
    ).currentEventResult;
    setShowEventDecision(!!updatedEvent);
  };

  const handleSavingsRateChange = (value: number[]) => {
    setSavingsRate(value[0]);
  };

  const handleEventDecision = (chooseOption1: boolean) => {
    gameEngine.decideEvent(!chooseOption1);
    triggerUpdate();
    setShowEventDecision(false);
  };

  // Chart data from real game history
  const chartData = useMemo(() => {
    return history.map((s: StateModel) => ({
      year: s.year,
      wealth:
        (s.portfolio?.cashInEuro ?? 0) +
        (s.portfolio?.cryptoInEuro ?? 0) +
        (s.portfolio?.etfInEuro ?? 0),
      satisfaction: s.lifeSatisfactionFrom1To100,
      goal: gameEngine.getGoals().buyingPrice,
    }));
  }, [history, gameEngine]);

  // Portfolio breakdown
  const portfolioBreakdown = useMemo(() => {
    return [
      {name: "Cash", value: state.portfolio?.cashInEuro ?? 0},
      {name: "Crypto", value: state.portfolio?.cryptoInEuro ?? 0},
      {name: "ETF", value: state.portfolio?.etfInEuro ?? 0},
    ].filter((item) => item.value > 0);
  }, [
    state.portfolio?.cashInEuro,
    state.portfolio?.cryptoInEuro,
    state.portfolio?.etfInEuro,
  ]);

  const portfolioColors = ["#10b981", "#f59e0b", "#6366f1"];
  const totalWealth = portfolioBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <main className="grid grid-cols-12 gap-4 p-4 h-screen bg-gray-50">
      {/* Left Sidebar: Controls */}
      <Card className="col-span-2 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Savings Rate</Label>
              <Slider
                value={[savingsRate]}
                onValueChange={handleSavingsRateChange}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-600">
                <span>Fixed Costs</span>
                <span className="font-bold text-gray-900">
                  {Math.round(savingsRate)}%
                </span>
                <span>Savings</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-600">Current Age</p>
                <p className="text-sm font-semibold">{state?.age ?? 0} years</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Year</p>
                <p className="text-sm font-semibold">{currentYear}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Wealth</p>
                <p className="text-sm font-semibold">
                  €{Math.round(totalWealth).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAdvanceYear}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={history.length === 0}
          >
            Next Year
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mb-6 bg-black text-white">
                Actions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actions</DialogTitle>
                <DialogDescription>
                  Decide which action you want to choose next
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => router.push("/simulation/find-homes")}>Move</Button>
                <Button onClick={() => null}>Change Occupation</Button>
                <Button onClick={() => null}>Manage Portfolio</Button>
                <Button onClick={() => null}>Take a Loan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Center: Charts */}
      <Card className="col-span-6 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">
          Wealth & Satisfaction Progress
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{top: 5, right: 30, left: 0, bottom: 5}}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Wealth (€)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{
                  value: "Satisfaction (0-100)",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip
                formatter={(value: number) =>
                  Math.round(value).toLocaleString()
                }
                contentStyle={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wealth"
                stroke="#10b981"
                name="Wealth"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="satisfaction"
                stroke="#f59e0b"
                name="Satisfaction"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="goal"
                stroke="#6b7280"
                strokeDasharray="5 5"
                name="Goal"
                dot={false}
                strokeWidth={1.5}
              />
              <ReferenceLine
                x={currentYear}
                stroke="#ef4444"
                strokeWidth={2}
                label={{
                  value: `Now: ${currentYear}`,
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Start the game from the init page to see your progress</p>
            <Button onClick={() => router.push("/init")}>Go to Init</Button>
          </div>
        )}
      </Card>

      {/* Right Sidebar: Events & Portfolio */}
      <Card className="col-span-4 p-4 flex flex-col gap-4">
        {/* Recent Events */}
        <div>
          <h3 className="font-bold text-sm mb-3">Recent Events</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {eventHistory.length > 0 ? (
              eventHistory
                .slice(-5)
                .reverse()
                .map((event: EventModel, idx: number) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-blue-50 rounded border border-blue-200"
                  >
                    <p className="font-semibold text-blue-900">
                      {event.eventDescription}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-xs text-gray-500">No events yet</p>
            )}
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="flex-1 flex flex-col items-center">
          <h3 className="font-bold text-sm mb-3">Portfolio Distribution</h3>
          {portfolioBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={portfolioBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={portfolioColors[index % portfolioColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `€${Math.round(value).toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-700 text-center mt-3 w-full space-y-1">
                {portfolioBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center gap-2"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          portfolioColors[idx % portfolioColors.length],
                      }}
                    />
                    <span>{item.name}:</span>
                    <span className="font-semibold">
                      €{Math.round(item.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">No portfolio data</p>
          )}
        </div>
      </Card>
    </main>
  );
}
