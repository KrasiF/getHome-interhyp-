"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen from-white to-gray-100 text-gray-900 flex flex-col items-center px-6 py-16">
      {/* Hero Section */}
      <section className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Simulate Your Life.<br /> Make Better Decisions.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Experience a unique life simulator where your choices shape your future. 
          Explore financial paths, family planning, career opportunities, and long‑term goals—
          all powered by real data and smart algorithms.
        </p>

        <Button
          size="lg"
          className="mt-4 text-lg px-8 py-6 rounded-xl"
          onClick={() => router.push("/init")}>
          Start the Game <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Screenshot / Preview Section */}
      <section className="mt-20 w-full max-w-5xl flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-6">A Glimpse Into Your Future</h2>
        <div className="w-full h-80 md:h-[450px] bg-gray-200 border border-gray-300 rounded-2xl flex items-center justify-center">
          <span className="text-gray-500 text-lg">[ Placeholder for App Screenshot ]</span>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 grid md:grid-cols-3 gap-12 max-w-6xl w-full">
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3">Smart Life Simulation</h3>
          <p className="text-gray-600 text-sm">
            Our event engine dynamically generates life events based on your choices, personality,
            and real‑world factors.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3">Career & Wealth Modeling</h3>
          <p className="text-gray-600 text-sm">
            See how your job, savings rate, and investments compound over time—and how lifestyle
            changes affect your future.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3">Personal Goals Tracking</h3>
          <p className="text-gray-600 text-sm">
            Define your dream home, family plans, and financial targets. Let the simulation show you
            how to get there.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Story?</h2>
        <Button
          size="lg"
          className="text-lg px-10 py-6 rounded-xl"
          onClick={() => router.push("/init")}>
          Start the Game
        </Button>
      </section>
    </main>
  );
}
