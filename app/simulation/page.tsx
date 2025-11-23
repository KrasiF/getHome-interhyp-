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

  const handleAdvanceYear = async () => {
    let gameEvent = await gameEngine.runLoop();
    triggerUpdate();
    setShowEventDecision(!!gameEvent);
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
  }, [history.length, state.year]);

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

  const CASH_COLOR = "#10b981";
  const CRYPTO_COLOR = "#f59e0b";
  const ETF_COLOR = "#6366f1";

  const portfolioColorsByName: Record<string, string> = {
    Cash: CASH_COLOR,
    Crypto: CRYPTO_COLOR,
    ETF: ETF_COLOR,
  };
  const totalWealth = portfolioBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center ml-2.5">
          <span className="text-2xl font-bold text-black mr-1" style={{ fontFamily: 'Avenir, "Avenir Next", system-ui, -apple-system, sans-serif' }}>getHome(</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 85" height="28" className="relative top-[3px]">
            <defs>
              <clipPath id="a">
                <path d="M0 0h400v85H0z"></path>
              </clipPath>
            </defs>
            <g clipPath="url(#a)">
              <g>
                <path d="M38.56 9.533A29.027 29.027 0 1067.587 38.56 29.032 29.032 0 0038.56 9.533m0-9.533A38.567 38.567 0 110 38.56 38.606 38.606 0 0138.56 0z" fill="#ee7900"></path>
              </g>
              <g>
                <path d="M101.173 9.547a5.665 5.665 0 015.8 5.8 5.8 5.8 0 11-11.6 0 5.657 5.657 0 015.8-5.8zM96.2 26.96h9.533v40.627H96.2z"></path>
                <path d="M116.506 26.96h9.533v5.8h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.41v24.057h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.534V26.96z"></path>
                <path d="M166.843 36.907h-7.47v-9.12h4.147c2.907 0 4.147-1.24 4.147-4.56v-8.293h8.707v12.853h9.12v9.12h-9.12v16.174c0 4.147 2.067 6.213 5.387 6.213a13.534 13.534 0 004.973-1.16v9.04a19.649 19.649 0 01-7.053 1.24c-7.88 0-12.853-4.973-12.853-14.093V36.907z"></path>
                <path d="M230.266 61.374s-5.387 7.053-17 7.053a21.149 21.149 0 11-.413-42.293c11.613 0 19.907 9.12 19.907 20.32a25.97 25.97 0 01-.413 4.56h-30.268c1 4.56 4.973 8.707 11.613 8.707a15.411 15.411 0 0011.2-5.053zm-7.867-18.24c-1.24-4.56-4.56-7.88-9.947-7.88-5.8 0-9.12 3.32-10.36 7.88z"></path>
                <path d="M240.213 26.96h9.533v5.8h.413s4.147-6.64 11.613-6.64h1.653v10.36a11.485 11.485 0 00-3.32-.413c-5.8 0-10.36 4.56-10.36 11.613v19.907h-9.532z"></path>
                <path d="M270.48 9.547h9.533V32.76h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.413v24.054h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.533V9.547z"></path>
                <path d="M314.173 74.64a10.518 10.518 0 004.973 1.24c3.733 0 5.64-2.16 7.053-5.387l1.24-2.907-16.173-40.626h10.36l10.79 28.2h.413l10.36-28.2h10.36l-17.416 44.36c-3.4 8.707-7.88 13.68-14.933 13.68a21.445 21.445 0 01-7.053-1.24v-9.12z"></path>
                <path d="M358.533 26.96h9.533v5.8h.413s3.733-6.64 13.267-6.64 18.253 8.72 18.253 21.16-8.706 21.15-18.239 21.15-13.267-6.64-13.267-6.64h-.413V85h-9.533V26.96zm31.933 20.32a11.207 11.207 0 10-22.4 0 11.207 11.207 0 1022.4 0z"></path>
              </g>
            </g>
          </svg>
          <span className="text-2xl font-bold text-black ml-1" style={{ fontFamily: 'Avenir, "Avenir Next", system-ui, -apple-system, sans-serif' }}>)</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="grid grid-cols-12 gap-4 p-4 flex-1">
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
                <Button onClick={() => router.push("/simulation/find-homes")}>
                  Move
                </Button>
                <Button
                  onClick={() => router.push("/simulation/find-occupation")}
                >
                  Change Occupation
                </Button>
                <Button
                  onClick={() => router.push("/simulation/manage-portfolio")}
                >
                  Manage Portfolio
                </Button>
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

      {/* Event Decision Dialog */}
      <Dialog open={showEventDecision} onOpenChange={setShowEventDecision}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Occurred!</DialogTitle>
            <DialogDescription>
              {currentEvent?.eventDescription}
            </DialogDescription>
          </DialogHeader>
          {currentEvent?.eventQuestion && (
            <div className="space-y-4">
              <p className="text-sm font-semibold">
                {currentEvent.eventQuestion}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleEventDecision(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => handleEventDecision(false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  No
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                .map((event: EventModel, idx: number) => {
                  const impact = event.chosenImpact;
                  const changes: string[] = [];
                  console.log(impact)
                  if (impact) {
                    // Portfolio changes
                    if (impact.newPortfolioModel?.cashInEuro !== undefined) {
                      const change = impact.newPortfolioModel.cashInEuro;
                      changes.push(
                        `Cash ${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString("de-DE")}€`
                      );
                    }
                    if (impact.newPortfolioModel?.cryptoInEuro !== undefined) {
                      const change = impact.newPortfolioModel.cryptoInEuro;
                      changes.push(
                        `Crypto ${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString("de-DE")}€`
                      );
                    }
                    if (impact.newPortfolioModel?.etfInEuro !== undefined) {
                      const change = impact.newPortfolioModel.etfInEuro;
                      changes.push(
                        `ETF ${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString("de-DE")}€`
                      );
                    }

                    // Satisfaction change
                    if (impact.changeInLifeSatisfactionFrom1To100) {
                      const change = impact.changeInLifeSatisfactionFrom1To100;
                      changes.push(
                        `Satisfaction ${change >= 0 ? "+" : ""}${change}`
                      );
                    }

                    // Savings rate change
                    if (impact.changeInSavingsRateInPercent) {
                      const change = impact.changeInSavingsRateInPercent;
                      changes.push(
                        `Savings Rate ${change >= 0 ? "+" : ""}${change}%`
                      );
                    }

                    // Children change
                    if (impact.changeInAmountOfChildren) {
                      const change = impact.changeInAmountOfChildren;
                      changes.push(
                        `Children ${change >= 0 ? "+" : ""}${change}`
                      );
                    }

                    // Education level
                    if (impact.newEducationLevel) {
                      changes.push(`Education: ${impact.newEducationLevel}`);
                    }

                    // Marriage
                    if (impact.newMarried !== null) {
                      changes.push(impact.newMarried ? "Got Married" : "Divorced");
                    }

                    // Occupation changes
                    if (impact.changeInOccupancyModel?.yearlySalaryInEuro) {
                      const change = impact.changeInOccupancyModel.yearlySalaryInEuro;
                      changes.push(
                        `Salary ${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString("de-DE")}€/yr`
                      );
                    }

                    // Living changes
                    if (impact.changeInLivingModel?.yearlyRentInEuro) {
                      const change = impact.changeInLivingModel.yearlyRentInEuro;
                      changes.push(
                        `Rent ${change >= 0 ? "+" : ""}${Math.round(change).toLocaleString("de-DE")}€/yr`
                      );
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-blue-50 rounded border border-blue-200"
                    >
                      <p className="font-semibold text-blue-900">
                        {event.eventDescription}
                      </p>
                      {changes.length > 0 && (
                        <div className="mt-1 space-y-0.5 text-gray-700">
                          {changes.map((change, i) => (
                            <p key={i} className="text-[10px]">
                              • {change}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
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
                        fill={portfolioColorsByName[entry.name] ?? CASH_COLOR}
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
                          portfolioColorsByName[item.name] ?? CASH_COLOR,
                      }}
                    />
                    <span>{item.name}:</span>
                    <span className="font-semibold">
                      €{Math.round(item.value).toLocaleString("de-DE")}
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
    </div>
  );
}
