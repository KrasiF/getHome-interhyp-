"use client";
import {useGameEngine} from "@/components/game-engine-context";
import {StateModel} from "@/game/models/state-model";
import {useEffect, useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {ChevronLeft, ChevronRight} from "lucide-react";

const CASH_COLOR = "#10b981";
const CRYPTO_COLOR = "#f59e0b";
const ETF_COLOR = "#6366f1";

export default function Wrapup() {
  const {engine: gameEngine} = useGameEngine();
  const state = gameEngine.getState() as StateModel;
  const history = gameEngine.getHistory() as StateModel[];

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  // Log state and history for debugging
  useEffect(() => {
    console.log("=== WRAPUP COMPONENT DEBUG ===");
    console.log("Current state:", state);
    console.log("State portfolio:", state.portfolio);
    console.log("History length:", history.length);
    console.log("Full history:", history);
  }, [state, history]);

  // Load recommendations on mount
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const feedback = await gameEngine.generateRecommendations();
        setRecommendations(feedback);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setRecommendations([
          "Unable to generate recommendations at this time.",
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [gameEngine]);

  // Chart data
  const chartData = useMemo(() => {
    const data = history.map((s: StateModel) => {
      const cash = Number(s.portfolio?.cashInEuro ?? 0);
      const crypto = Number(s.portfolio?.cryptoInEuro ?? 0);
      const etf = Number(s.portfolio?.etfInEuro ?? 0);
      const wealth = cash + crypto + etf;
      const satisfaction = Number(s.lifeSatisfactionFrom1To100 ?? 0);

      return {
        year: s.year,
        wealth: wealth,
        satisfaction: satisfaction,
      };
    });

    console.log("Chart data generated:", data);
    return data;
  }, [history]);

  // Portfolio breakdown
  const portfolioBreakdown = useMemo(() => {
    const cash = Number(state.portfolio?.cashInEuro ?? 0);
    const crypto = Number(state.portfolio?.cryptoInEuro ?? 0);
    const etf = Number(state.portfolio?.etfInEuro ?? 0);

    const breakdown = [
      {name: "Cash", value: cash},
      {name: "Crypto", value: crypto},
      {name: "ETF", value: etf},
    ].filter((item) => item.value > 0);

    console.log("Portfolio breakdown:", breakdown);
    console.log("Raw portfolio data:", {cash, crypto, etf});

    return breakdown;
  }, [state.portfolio]);

  const portfolioColorsByName: Record<string, string> = {
    Cash: CASH_COLOR,
    Crypto: CRYPTO_COLOR,
    ETF: ETF_COLOR,
  };

  const totalWealth = portfolioBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Create slides with recommendations and charts
  const slides = useMemo(() => {
    const allSlides: Array<{
      type:
        | "recommendation"
        | "chart-portfolio"
        | "chart-progress"
        | "intro"
        | "finale";
      content?: string;
    }> = [];

    // Intro slide
    allSlides.push({type: "intro"});

    // Recommendation slides
    recommendations.forEach((rec) => {
      allSlides.push({type: "recommendation", content: rec});
    });

    // Portfolio chart slide
    if (portfolioBreakdown.length > 0) {
      allSlides.push({type: "chart-portfolio"});
    }

    // Progress chart slide
    if (chartData.length > 0) {
      allSlides.push({type: "chart-progress"});
    }

    // Finale slide
    allSlides.push({type: "finale"});

    return allSlides;
  }, [recommendations, portfolioBreakdown, chartData]);

  const totalSlides = slides.length;

  // Auto-advance progress bar
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          // Auto-advance to next slide
          if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
            return 0;
          }
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds per slide (100 * 50ms = 5000ms)

    return () => clearInterval(interval);
  }, [currentSlide, loading, totalSlides]);

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setSlideProgress(0);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      setSlideProgress(0);
    }
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setSlideProgress(0);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-linear-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl font-bold mb-4">
            Generating Your Wrapped...
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  // Define different background gradients for variety
  const getBackgroundGradient = (slideType: string, index: number) => {
    const gradients = [
      "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
      "bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500",
      "bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400",
      "bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400",
      "bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-500",
      "bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500",
      "bg-gradient-to-br from-orange-600 via-red-500 to-pink-500",
      "bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-500",
    ];

    if (slideType === "intro") return gradients[0];
    if (slideType === "finale") return gradients[6];
    if (slideType === "chart-portfolio") return gradients[4];
    if (slideType === "chart-progress") return gradients[2];

    // For recommendations, cycle through remaining gradients
    return gradients[1 + (index % 6)];
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Navigation Areas */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
        onClick={handlePrevious}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
        onClick={handleNext}
      />

      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
        {slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
            onClick={() => handleSlideClick(index)}
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width:
                  index < currentSlide
                    ? "100%"
                    : index === currentSlide
                    ? `${slideProgress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className={`w-full max-w-md h-full relative transition-all duration-500 ${getBackgroundGradient(
          currentSlideData.type,
          currentSlide
        )}`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {currentSlideData.type === "intro" && (
            <div className="text-center text-white space-y-6">
              <div className="text-6xl font-bold animate-pulse">🏠</div>
              <h1 className="text-4xl font-bold">Your getHome Wrapped</h1>
              <p className="text-xl">Let&apos;s look at your journey...</p>
              <div className="flex items-center justify-center gap-2 mt-8">
                <p className="text-sm opacity-70">Powered by</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 85"
                  height="18"
                  className="opacity-80"
                >
                  <defs>
                    <clipPath id="a-intro">
                      <path d="M0 0h400v85H0z"></path>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#a-intro)">
                    <g>
                      <path
                        d="M38.56 9.533A29.027 29.027 0 1067.587 38.56 29.032 29.032 0 0038.56 9.533m0-9.533A38.567 38.567 0 110 38.56 38.606 38.606 0 0138.56 0z"
                        fill="#fff"
                      ></path>
                    </g>
                    <g>
                      <path
                        d="M101.173 9.547a5.665 5.665 0 015.8 5.8 5.8 5.8 0 11-11.6 0 5.657 5.657 0 015.8-5.8zM96.2 26.96h9.533v40.627H96.2z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M116.506 26.96h9.533v5.8h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.41v24.057h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.534V26.96z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M166.843 36.907h-7.47v-9.12h4.147c2.907 0 4.147-1.24 4.147-4.56v-8.293h8.707v12.853h9.12v9.12h-9.12v16.174c0 4.147 2.067 6.213 5.387 6.213a13.534 13.534 0 004.973-1.16v9.04a19.649 19.649 0 01-7.053 1.24c-7.88 0-12.853-4.973-12.853-14.093V36.907z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M230.266 61.374s-5.387 7.053-17 7.053a21.149 21.149 0 11-.413-42.293c11.613 0 19.907 9.12 19.907 20.32a25.97 25.97 0 01-.413 4.56h-30.268c1 4.56 4.973 8.707 11.613 8.707a15.411 15.411 0 0011.2-5.053zm-7.867-18.24c-1.24-4.56-4.56-7.88-9.947-7.88-5.8 0-9.12 3.32-10.36 7.88z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M240.213 26.96h9.533v5.8h.413s4.147-6.64 11.613-6.64h1.653v10.36a11.485 11.485 0 00-3.32-.413c-5.8 0-10.36 4.56-10.36 11.613v19.907h-9.532z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M270.48 9.547h9.533V32.76h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.413v24.054h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.533V9.547z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M314.173 74.64a10.518 10.518 0 004.973 1.24c3.733 0 5.64-2.16 7.053-5.387l1.24-2.907-16.173-40.626h10.36l10.79 28.2h.413l10.36-28.2h10.36l-17.416 44.36c-3.4 8.707-7.88 13.68-14.933 13.68a21.445 21.445 0 01-7.053-1.24v-9.12z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M358.533 26.96h9.533v5.8h.413s3.733-6.64 13.267-6.64 18.253 8.72 18.253 21.16-8.706 21.15-18.239 21.15-13.267-6.64-13.267-6.64h-.413V85h-9.533V26.96zm31.933 20.32a11.207 11.207 0 10-22.4 0 11.207 11.207 0 1022.4 0z"
                        fill="#fff"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {currentSlideData.type === "recommendation" && (
            <div className="text-white space-y-6">
              <div className="text-5xl mb-8 text-center">✨</div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <p className="text-2xl font-semibold leading-relaxed text-center">
                  {currentSlideData.content}
                </p>
              </div>
            </div>
          )}

          {currentSlideData.type === "chart-portfolio" && (
            <div className="text-white space-y-6 w-full">
              <h2 className="text-3xl font-bold text-center">
                Your Portfolio Mix
              </h2>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={portfolioBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) =>
                        `${entry.name}: €${Math.round(
                          entry.value
                        ).toLocaleString()}`
                      }
                      labelLine={false}
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
                <div className="mt-4 space-y-2">
                  {portfolioBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              portfolioColorsByName[item.name] ?? CASH_COLOR,
                          }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">
                        €{Math.round(item.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-white/30 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{Math.round(totalWealth).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSlideData.type === "chart-progress" && (
            <div className="text-white space-y-6 w-full">
              <h2 className="text-3xl font-bold text-center">Your Journey</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="white"
                      style={{fontSize: "12px"}}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={CASH_COLOR}
                      style={{fontSize: "12px"}}
                      tickFormatter={(value) =>
                        `€${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#ec4899"
                      style={{fontSize: "12px"}}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "Wealth (€)") {
                          return `€${Math.round(value).toLocaleString()}`;
                        }
                        return value.toFixed(1);
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="wealth"
                      stroke={CASH_COLOR}
                      strokeWidth={3}
                      name="Wealth (€)"
                      dot={{fill: CASH_COLOR, r: 4}}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#ec4899"
                      strokeWidth={3}
                      name="Life Satisfaction"
                      dot={{fill: "#ec4899", r: 4}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {currentSlideData.type === "finale" && (
            <div className="text-center text-white space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold">That&apos;s Your Wrap!</h1>
              <p className="text-xl">
                Final Wealth: €{Math.round(totalWealth).toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <p className="text-sm opacity-70">Powered by</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 85"
                  height="18"
                  className="opacity-80"
                >
                  <defs>
                    <clipPath id="a-finale">
                      <path d="M0 0h400v85H0z"></path>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#a-finale)">
                    <g>
                      <path
                        d="M38.56 9.533A29.027 29.027 0 1067.587 38.56 29.032 29.032 0 0038.56 9.533m0-9.533A38.567 38.567 0 110 38.56 38.606 38.606 0 0138.56 0z"
                        fill="#fff"
                      ></path>
                    </g>
                    <g>
                      <path
                        d="M101.173 9.547a5.665 5.665 0 015.8 5.8 5.8 5.8 0 11-11.6 0 5.657 5.657 0 015.8-5.8zM96.2 26.96h9.533v40.627H96.2z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M116.506 26.96h9.533v5.8h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.41v24.057h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.534V26.96z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M166.843 36.907h-7.47v-9.12h4.147c2.907 0 4.147-1.24 4.147-4.56v-8.293h8.707v12.853h9.12v9.12h-9.12v16.174c0 4.147 2.067 6.213 5.387 6.213a13.534 13.534 0 004.973-1.16v9.04a19.649 19.649 0 01-7.053 1.24c-7.88 0-12.853-4.973-12.853-14.093V36.907z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M230.266 61.374s-5.387 7.053-17 7.053a21.149 21.149 0 11-.413-42.293c11.613 0 19.907 9.12 19.907 20.32a25.97 25.97 0 01-.413 4.56h-30.268c1 4.56 4.973 8.707 11.613 8.707a15.411 15.411 0 0011.2-5.053zm-7.867-18.24c-1.24-4.56-4.56-7.88-9.947-7.88-5.8 0-9.12 3.32-10.36 7.88z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M240.213 26.96h9.533v5.8h.413s4.147-6.64 11.613-6.64h1.653v10.36a11.485 11.485 0 00-3.32-.413c-5.8 0-10.36 4.56-10.36 11.613v19.907h-9.532z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M270.48 9.547h9.533V32.76h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.413v24.054h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.533V9.547z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M314.173 74.64a10.518 10.518 0 004.973 1.24c3.733 0 5.64-2.16 7.053-5.387l1.24-2.907-16.173-40.626h10.36l10.79 28.2h.413l10.36-28.2h10.36l-17.416 44.36c-3.4 8.707-7.88 13.68-14.933 13.68a21.445 21.445 0 01-7.053-1.24v-9.12z"
                        fill="#fff"
                      ></path>
                      <path
                        d="M358.533 26.96h9.533v5.8h.413s3.733-6.64 13.267-6.64 18.253 8.72 18.253 21.16-8.706 21.15-18.239 21.15-13.267-6.64-13.267-6.64h-.413V85h-9.533V26.96zm31.933 20.32a11.207 11.207 0 10-22.4 0 11.207 11.207 0 1022.4 0z"
                        fill="#fff"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="pt-6">
                <Button
                  onClick={() => (window.location.href = "/init")}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-full text-lg"
                >
                  Start New Journey
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <div className="flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
            {currentSlide + 1} / {totalSlides}
          </div>
          <button
            onClick={handleNext}
            disabled={currentSlide === totalSlides - 1}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
