"use client";
import React, {useEffect, useState, useRef} from "react";
import {useGameEngine} from "@/components/game-engine-context";
import {useRouter} from "next/navigation";
import {ResponsiveContainer, PieChart, Pie, Cell} from "recharts";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";

export default function ManagePortfolio() {
  const {engine: gameEngine, triggerUpdate} = useGameEngine();
  const router = useRouter();

  const portfolio = gameEngine.getState()?.portfolio;
  const total =
    (portfolio?.cashInEuro ?? 0) +
    (portfolio?.cryptoInEuro ?? 0) +
    (portfolio?.etfInEuro ?? 0);
  const fallbackBase = 10000;
  const baseAmount = total > 0 ? total : fallbackBase;

  // allocation as percentages (sum to 100)
  const [alloc, setAlloc] = useState<{
    cash: number;
    crypto: number;
    etf: number;
  }>(() => {
    if (total > 0) {
      const cash = Math.round(((portfolio?.cashInEuro ?? 0) / total) * 100);
      const crypto = Math.round(((portfolio?.cryptoInEuro ?? 0) / total) * 100);
      const etf = Math.max(0, 100 - cash - crypto);
      return {cash, crypto, etf};
    }
    return {cash: 33, crypto: 33, etf: 34};
  });

  const draggingRef = useRef<null | "left" | "right">(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState<number>(0);

  useEffect(() => {
    // keep allocation synced if external portfolio changed
    const p = gameEngine.getState()?.portfolio;
    const t =
      (p?.cashInEuro ?? 0) + (p?.cryptoInEuro ?? 0) + (p?.etfInEuro ?? 0);
    if (t > 0) {
      const cash = Math.round(((p?.cashInEuro ?? 0) / t) * 100);
      const crypto = Math.round(((p?.cryptoInEuro ?? 0) / t) * 100);
      const etf = Math.max(0, 100 - cash - crypto);
      // only set if different to avoid extra renders
      if (cash !== alloc.cash || crypto !== alloc.crypto || etf !== alloc.etf) {
        setAlloc({cash, crypto, etf});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameEngine]);

  // measure track width to compute a minimum visual gap when crypto is 0
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setTrackWidth(el.getBoundingClientRect().width || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const colors = ["#10b981", "#f59e0b", "#6366f1"];

  // allocation adjustments are handled directly in pointer/slider handlers

  // Pointer-based dragging for custom rebalance bar
  const startHandleDrag =
    (side: "left" | "right") => (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = side;
      (e.target as Element).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let pct = ((ev.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, Math.round(pct)));
        const b1 = side === "left" ? pct : alloc.cash;
        const b2 = side === "right" ? pct : alloc.cash + alloc.crypto;
        const cash = Math.max(0, Math.min(100, Math.round(b1)));
        const crypto = Math.max(0, Math.round(b2 - b1));
        const etf = Math.max(0, 100 - cash - crypto);
        setAlloc({cash, crypto, etf});
      };

      const onUp = () => {
        draggingRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };

  const handleApply = () => {
    const base = baseAmount;
    const newPortfolioModel = {
      cashInEuro: Math.round((alloc.cash / 100) * base),
      cryptoInEuro: Math.round((alloc.crypto / 100) * base),
      etfInEuro: Math.round((alloc.etf / 100) * base),
    };
    gameEngine.decideActions({
      newOccupationModel: null,
      newPortfolioModel,
      newLivingModel: null,
      newSavingsRateInPercent: null,
    });
    triggerUpdate?.();
    router.push("/simulation");
  };

  const data = [
    {name: "Cash", value: alloc.cash},
    {name: "Crypto", value: alloc.crypto},
    {name: "ETF", value: alloc.etf},
  ];

  // visual helpers: ensure a small visible area for crypto when its value is 0
  const minPixels = 20;
  const minPercent = trackWidth > 0 ? (minPixels / trackWidth) * 100 : 2;
  const visualCrypto =
    alloc.crypto > 0 ? alloc.crypto : Math.min(minPercent, 10);
  const visualRight = alloc.cash + visualCrypto;

  return (
    <main className="p-6">
      <Card className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Manage Portfolio</h2>
        <p className="text-sm text-gray-600 mb-4">
          Drag a slice (click and drag up/down) to change its allocation. The
          other slices update proportionally to keep the total at 100%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  outerRadius={100}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 flex gap-4 text-sm">
              <div>
                Cash: <span className="font-semibold">{alloc.cash}%</span>
              </div>
              <div>
                Crypto: <span className="font-semibold">{alloc.crypto}%</span>
              </div>
              <div>
                ETF: <span className="font-semibold">{alloc.etf}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Base amount used for conversion: €
              {Math.round(baseAmount).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <Label className="text-sm font-semibold mb-2">
              Rebalance Allocation
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Drag the two handles to set how much is in Cash (left handle) and
              how much is in Cash+Crypto (right handle). Crypto is the middle
              segment.
            </p>

            <div className="relative mt-2">
              {/* gradient track */}
              <div
                ref={trackRef}
                className="relative w-full h-6 rounded-md overflow-visible"
                style={{
                  touchAction: "none",
                }}
              >
                <div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-3 rounded"
                  style={{
                    background: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} ${alloc.cash}%, ${colors[1]} ${alloc.cash}%, ${colors[1]} ${visualRight}%, ${colors[2]} ${visualRight}%, ${colors[2]} 100%)`,
                  }}
                />

                {/* left handle */}
                <button
                  onPointerDown={startHandleDrag("left")}
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow"
                  style={{
                    left: `${alloc.cash}%`,
                    background: colors[0],
                    transform: "translate(-50%, -50%)",
                    cursor: "ew-resize",
                    zIndex: 20,
                  }}
                  aria-label="Move cash boundary"
                />

                {/* right handle (visual offset when crypto === 0 so users can grab it) */}
                <button
                  onPointerDown={startHandleDrag("right")}
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow"
                  style={{
                    left: `${visualRight}%`,
                    background: colors[1],
                    transform: "translate(-50%, -50%)",
                    cursor: "ew-resize",
                    zIndex: 10,
                  }}
                  aria-label="Move crypto boundary"
                />
              </div>
            </div>
            <div className="flex gap-3 items-center mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{background: colors[0]}}
                />
                <span className="text-sm">Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{background: colors[1]}}
                />
                <span className="text-sm">Crypto</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{background: colors[2]}}
                />
                <span className="text-sm">ETF</span>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <div className="mb-2">Resulting allocation:</div>
              <div className="mt-1">
                Cash: <span className="font-semibold">{alloc.cash}%</span>
              </div>
              <div className="mt-1">
                Crypto: <span className="font-semibold">{alloc.crypto}%</span>
              </div>
              <div className="mt-1">
                ETF: <span className="font-semibold">{alloc.etf}%</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Resulting amounts (approx):
              </div>
              <div className="mt-1">
                <div>
                  Cash: €
                  {Math.round((alloc.cash / 100) * baseAmount).toLocaleString()}
                </div>
                <div>
                  Crypto: €
                  {Math.round(
                    (alloc.crypto / 100) * baseAmount
                  ).toLocaleString()}
                </div>
                <div>
                  ETF: €
                  {Math.round((alloc.etf / 100) * baseAmount).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={handleApply} className="bg-green-600 text-white">
                Apply
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/simulation")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
