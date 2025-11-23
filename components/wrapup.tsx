"use client";
import {useGameEngine} from "@/components/game-engine-context";
import {StateModel} from "@/game/models/state-model";
import {useEffect, useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {ArrowRight, ChevronLeft, ChevronRight} from "lucide-react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";

const CASH_COLOR = "#10b981";
const CRYPTO_COLOR = "#f59e0b";
const ETF_COLOR = "#6366f1";

export default function Wrapup() {
  const {engine: gameEngine} = useGameEngine();
  const state = gameEngine.getState() as StateModel;
  const history = gameEngine.getHistory() as StateModel[];
  const router = useRouter();

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
    if (!state.portfolio) {
      console.warn("No portfolio data available");
      return [];
    }

    const cash = Number(state.portfolio?.cashInEuro ?? 0);
    const crypto = Number(state.portfolio?.cryptoInEuro ?? 0);
    const etf = Number(state.portfolio?.etfInEuro ?? 0);

    console.log("=== PORTFOLIO BREAKDOWN DEBUG ===");
    console.log("Raw portfolio:", state.portfolio);
    console.log("Parsed values:", {cash, crypto, etf});

    const breakdown = [
      {name: "Cash", value: cash},
      {name: "Crypto", value: crypto},
      {name: "ETF", value: etf},
    ].filter((item) => {
      const isValid =
        item.value > 0 && !isNaN(item.value) && isFinite(item.value);
      console.log(`${item.name}: ${item.value} - valid: ${isValid}`);
      return isValid;
    });

    console.log("Final breakdown for chart:", breakdown);
    console.log("Breakdown length:", breakdown.length);

    return breakdown;
  }, [state.portfolio]);

  const portfolioColorsByName: Record<string, string> = {
    Cash: CASH_COLOR,
    Crypto: CRYPTO_COLOR,
    ETF: ETF_COLOR,
  };

  const totalWealth = useMemo(() => {
    const total = portfolioBreakdown.reduce((sum, item) => sum + item.value, 0);
    console.log("Total wealth calculated:", total);
    return total;
  }, [portfolioBreakdown]);

  const MAX_SLIDES = 5; // Change this to a number like 10 to limit slides

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
    console.log(
      "Checking portfolio slide - breakdown length:",
      portfolioBreakdown.length
    );
    if (portfolioBreakdown.length > 0) {
      console.log("Adding portfolio slide");
      allSlides.push({type: "chart-portfolio"});
    } else {
      console.log("Skipping portfolio slide - no data");
    }

    // Progress chart slide
    if (chartData.length > 0) {
      allSlides.push({type: "chart-progress"});
    }

    // Apply slide limit if configured (before adding finale to ensure finale is always last)
    if (MAX_SLIDES !== null && allSlides.length >= MAX_SLIDES) {
      console.log(
        `Limiting slides from ${
          allSlides.length + 1
        } to ${MAX_SLIDES} (including finale)`
      );
      // Trim slides to make room for finale, then add finale
      const limitedSlides = allSlides.slice(0, MAX_SLIDES - 1);
      limitedSlides.push({type: "finale"});
      return limitedSlides;
    }

    // Finale slide - always included
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
      "bg-linear-to-br from-orange-600 via-red-500 to-yellow-500",
      "bg-linear-to-br from-purple-600 via-pink-500 to-orange-400",
      "bg-linear-to-br from-blue-600 via-cyan-500 to-teal-400",
      "bg-linear-to-br from-green-600 via-emerald-500 to-teal-400",
      "bg-linear-to-br from-orange-500 via-amber-500 to-yellow-400",
      "bg-linear-to-br from-indigo-600 via-purple-500 to-pink-500",
      "bg-linear-to-br from-yellow-600 via-orange-500 to-red-500",
      "bg-linear-to-br from-violet-600 via-purple-500 to-fuchsia-500",
      "bg-linear-to-br from-emerald-600 via-green-500 to-lime-400",
      "bg-linear-to-br from-cyan-600 via-blue-500 to-indigo-500",
    ];

    if (slideType === "intro") return gradients[0];
    if (slideType === "finale") return gradients[6];
    if (slideType === "chart-portfolio") return gradients[3];
    if (slideType === "chart-progress") return gradients[2];

    // For recommendations, cycle through remaining gradients
    return gradients[1 + (index % 6)];
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Navigation Areas */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={handlePrevious}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={handleNext}
      />

      {/* Progress Bars */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 flex gap-2 z-30">
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
        className={`w-full h-full relative transition-all duration-500 ${getBackgroundGradient(
          currentSlideData.type,
          currentSlide
        )}`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-12 md:p-16">
          {currentSlideData.type === "intro" && (
            <div className="text-center text-white space-y-8">
              <div className="text-9xl font-bold animate-pulse">🏠</div>
              <h1 className="text-6xl md:text-7xl font-bold">
                Your getHome Wrapped
              </h1>
              <p className="text-2xl md:text-3xl">
                Let&apos;s look at your journey...
              </p>
              <div className="flex items-center justify-center gap-3 mt-12">
                <p className="text-lg opacity-70">Powered by</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 85"
                  height="24"
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
            <div className="text-white space-y-8 max-w-4xl mx-auto">
              <div className="text-7xl mb-12 text-center">✨</div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
                <p className="text-3xl md:text-4xl font-semibold leading-relaxed text-center">
                  {currentSlideData.content}
                </p>
              </div>
            </div>
          )}

          {currentSlideData.type === "chart-portfolio" && (
            <div className="text-white space-y-8 w-full max-w-5xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-center">
                Your Portfolio Mix
              </h2>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20">
                <div className="space-y-3">
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
            <div className="text-white space-y-8 w-full max-w-5xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold text-center">
                Your Journey
              </h2>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20">
                <ResponsiveContainer width="100%" height={450}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorWealth"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={CASH_COLOR}
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor={CASH_COLOR}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorSatisfaction"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ec4899"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ec4899"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
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
                        if (name === "Wealth") {
                          return `€${Math.round(value).toLocaleString()}`;
                        }
                        return value.toFixed(1);
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="wealth"
                      stroke={CASH_COLOR}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorWealth)"
                      name="Wealth"
                      dot={{fill: CASH_COLOR, r: 3}}
                      activeDot={{r: 5}}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#ec4899"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSatisfaction)"
                      name="Satisfaction"
                      dot={{fill: "#ec4899", r: 3}}
                      activeDot={{r: 5}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {currentSlideData.type === "finale" && (
            <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
              <div className="text-9xl mb-8">🎉</div>
              <h1 className="text-6xl md:text-7xl font-bold">
                That&apos;s Your Wrap!
              </h1>
              <p className="text-3xl md:text-4xl">
                Final Wealth: €{Math.round(totalWealth).toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <p className="text-lg opacity-70">Powered by</p>
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
              <div className="pt-8 flex justify-center">
                <motion.div
                  whileHover={{scale: 1.05, rotate: [0, -1, 1, 0]}}
                  whileTap={{scale: 0.95}}
                  className="relative"
                  onMouseEnter={(e) => {
                    const emojis = [
                      "🏠",
                      "💰",
                      "📈",
                      "🎯",
                      "✨",
                      "🌟",
                      "💫",
                      "🚀",
                    ];
                    for (let i = 0; i < 12; i++) {
                      const emoji = document.createElement("span");
                      emoji.textContent =
                        emojis[Math.floor(Math.random() * emojis.length)];
                      emoji.style.position = "absolute";
                      emoji.style.left = "50%";
                      emoji.style.top = "50%";
                      emoji.style.pointerEvents = "none";
                      emoji.style.fontSize = "28px";
                      emoji.style.zIndex = "100";
                      const angle = (Math.PI * 2 * i) / 12;
                      const velocity = 120 + Math.random() * 60;
                      e.currentTarget.appendChild(emoji);

                      const animation = emoji.animate(
                        [
                          {
                            transform:
                              "translate(-50%, -50%) scale(0) rotate(0deg)",
                            opacity: 1,
                          },
                          {
                            transform: `translate(calc(-50% + ${
                              Math.cos(angle) * velocity
                            }px), calc(-50% + ${
                              Math.sin(angle) * velocity
                            }px)) scale(1.2) rotate(${
                              360 * (Math.random() > 0.5 ? 1 : -1)
                            }deg)`,
                            opacity: 0,
                          },
                        ],
                        {
                          duration: 1200,
                          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }
                      );

                      animation.onfinish = () => emoji.remove();
                    }
                  }}
                >
                  <Button
                    size="lg"
                    className="text-xl px-16 py-8 rounded-full bg-white text-black hover:bg-linear-to-r hover:from-orange-400 hover:via-red-400 hover:to-yellow-400 hover:text-white transition-all duration-300 flex items-center gap-4 shadow-2xl hover:shadow-orange-500/60"
                    onClick={() => router.push("/init")}
                  >
                    Begin Simulation <ArrowRight className="w-6 h-6" />
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Indicators */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 z-10">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="p-4 rounded-full bg-white/20 backdrop-blur-sm disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="text-white" size={32} />
          </button>
          <div className="flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium text-xl">
            {currentSlide + 1} / {totalSlides}
          </div>
          <button
            onClick={handleNext}
            disabled={currentSlide === totalSlides - 1}
            className="p-4 rounded-full bg-white/20 backdrop-blur-sm disabled:opacity-30 hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="text-white" size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
