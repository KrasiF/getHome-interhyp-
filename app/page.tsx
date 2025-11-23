"use client";

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {ArrowRight} from "lucide-react";
import {motion, useScroll, useTransform} from "framer-motion";
import Image from "next/image";
import {useRef} from "react";

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <div ref={containerRef} className="bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section
        style={{opacity: heroOpacity, scale: heroScale}}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      >
        <motion.h1
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, delay: 0.2}}
          className="text-7xl md:text-8xl font-semibold text-center mb-6 tracking-tight"
        >
          Your Life.
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-br from-orange-500 via-red-500 to-yellow-500">
            Simulated.
          </span>
        </motion.h1>

        <motion.p
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, delay: 0.4}}
          className="text-xl md:text-2xl text-gray-400 text-center max-w-3xl mb-12 leading-relaxed"
        >
          Make smarter decisions today by seeing tomorrow. Experience how career
          choices, investments, and life events shape your future—all in
          real-time.
        </motion.p>

        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, delay: 0.6}}
          className="relative"
          onMouseEnter={(e) => {
            const emojis = ["🚀", "✨", "💫", "⭐", "🌟"];
            for (let i = 0; i < 8; i++) {
              const emoji = document.createElement("span");
              emoji.textContent =
                emojis[Math.floor(Math.random() * emojis.length)];
              emoji.style.position = "absolute";
              emoji.style.left = "50%";
              emoji.style.top = "50%";
              emoji.style.pointerEvents = "none";
              emoji.style.fontSize = "24px";
              emoji.style.zIndex = "100";
              const angle = (Math.PI * 2 * i) / 8;
              const velocity = 100 + Math.random() * 50;
              e.currentTarget.appendChild(emoji);

              const animation = emoji.animate(
                [
                  {transform: "translate(-50%, -50%) scale(0)", opacity: 1},
                  {
                    transform: `translate(calc(-50% + ${
                      Math.cos(angle) * velocity
                    }px), calc(-50% + ${
                      Math.sin(angle) * velocity
                    }px)) scale(1)`,
                    opacity: 0,
                  },
                ],
                {
                  duration: 1000,
                  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }
              );

              animation.onfinish = () => emoji.remove();
            }
          }}
        >
          <motion.div
            whileHover={{scale: 1.05, rotate: [0, -2, 2, 0]}}
            whileTap={{scale: 0.95}}
          >
            <Button
              size="lg"
              className="text-lg px-12 py-7 rounded-full bg-white text-black hover:bg-linear-to-r hover:from-orange-400 hover:to-yellow-400 hover:text-white transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-orange-500/50"
              onClick={() => router.push("/init")}
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 1, delay: 1}}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{y: [0, 12, 0]}}
              transition={{duration: 1.5, repeat: Infinity}}
              className="w-1.5 h-1.5 bg-gray-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Main Screenshot Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{opacity: 0, y: 100}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 1, ease: "easeOut"}}
          viewport={{once: true, margin: "-100px"}}
          className="w-full max-w-7xl"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <Image
              src="/screenshot.png"
              alt="Life Simulation Game Interface"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>

          <motion.p
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            transition={{duration: 1, delay: 0.3}}
            viewport={{once: true}}
            className="text-center text-gray-400 mt-8 text-lg"
          >
            Navigate through life&apos;s biggest decisions with confidence
          </motion.p>
        </motion.div>
      </section>

      {/* Wrapup Feature Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{opacity: 0, y: 50}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
          viewport={{once: true, margin: "-100px"}}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 tracking-tight">
            Your Story, Visualized
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Watch your journey unfold with beautiful insights. Every decision,
            every milestone, captured in an Instagram-style story experience.
          </p>
        </motion.div>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{opacity: 0, x: -50}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.8, delay: 0.2}}
            viewport={{once: true}}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
          >
            <Image
              src="/wrapped.png"
              alt="Wrapped Story Interface"
              width={1080}
              height={1920}
              className="w-full h-auto"
            />
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 50}}
            whileInView={{opacity: 1, x: 0}}
            transition={{duration: 0.8, delay: 0.4}}
            viewport={{once: true}}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold">Track Your Progress</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                See your wealth grow, your portfolio evolve, and your life
                satisfaction change over the years. Beautiful charts that tell
                your story.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-semibold">AI-Powered Insights</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Get personalized recommendations based on your journey. Learn
                what worked, what didn&apos;t, and how to optimize your path to
                success.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-semibold">Share Your Achievement</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Reached your goals? Share your success story with beautiful,
                swipeable slides that showcase your journey.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-32">
        <motion.div
          initial={{opacity: 0, y: 50}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
          viewport={{once: true, margin: "-100px"}}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-semibold mb-6 tracking-tight">
            Powered by Intelligence
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Advanced algorithms simulate real-world scenarios, market dynamics,
            and life events to give you the most realistic experience possible.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Dynamic Events",
              description:
                "Experience unexpected life events—from career opportunities to market crashes. Each simulation is unique.",
            },
            {
              title: "Real Estate & Investment",
              description:
                "Explore property markets, build a crypto portfolio, and manage ETF investments with real-world dynamics.",
            },
            {
              title: "Career Progression",
              description:
                "Choose your path, switch careers, and see how each decision impacts your financial future and satisfaction.",
            },
            {
              title: "Family Planning",
              description:
                "Model the financial impact of marriage, children, and lifestyle changes on your long-term goals.",
            },
            {
              title: "Market Simulation",
              description:
                "Realistic market fluctuations affect your investments, teaching you risk management and strategy.",
            },
            {
              title: "Goal Achievement",
              description:
                "Set ambitious targets and watch the simulator guide you toward making them a reality.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.6, delay: index * 0.1}}
              viewport={{once: true}}
              className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{opacity: 0, y: 50}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 1}}
          viewport={{once: true}}
          className="text-center space-y-8"
        >
          <h2 className="text-6xl md:text-7xl font-semibold tracking-tight">
            Ready to see
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-br from-orange-500 via-red-500 to-yellow-500">
              your future?
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Start your life simulation now. No sign-up required. Make decisions,
            face events, and build the future you&apos;ve always imagined.
          </p>

          <div className="flex justify-center">
            <motion.div
              whileHover={{scale: 1.05, rotate: [0, -1, 1, 0]}}
              whileTap={{scale: 0.95}}
              className="relative"
              onMouseEnter={(e) => {
                const emojis = ["🏠", "💰", "📈", "🎯", "✨", "🌟", "💫", "🚀"];
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
        </motion.div>

        <motion.div
          initial={{opacity: 0}}
          whileInView={{opacity: 1}}
          transition={{duration: 1, delay: 0.5}}
          viewport={{once: true}}
          className="mt-24 flex items-center justify-center gap-2"
        >
          <p className="text-sm text-gray-500">Powered by</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 85"
            height="18"
            className="opacity-60"
          >
            <defs>
              <clipPath id="a-landing">
                <path d="M0 0h400v85H0z"></path>
              </clipPath>
            </defs>
            <g clipPath="url(#a-landing)">
              <g>
                <path
                  d="M38.56 9.533A29.027 29.027 0 1067.587 38.56 29.032 29.032 0 0038.56 9.533m0-9.533A38.567 38.567 0 110 38.56 38.606 38.606 0 0138.56 0z"
                  fill="#9ca3af"
                ></path>
              </g>
              <g>
                <path
                  d="M101.173 9.547a5.665 5.665 0 015.8 5.8 5.8 5.8 0 11-11.6 0 5.657 5.657 0 015.8-5.8zM96.2 26.96h9.533v40.627H96.2z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M116.506 26.96h9.533v5.8h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.41v24.057h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.534V26.96z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M166.843 36.907h-7.47v-9.12h4.147c2.907 0 4.147-1.24 4.147-4.56v-8.293h8.707v12.853h9.12v9.12h-9.12v16.174c0 4.147 2.067 6.213 5.387 6.213a13.534 13.534 0 004.973-1.16v9.04a19.649 19.649 0 01-7.053 1.24c-7.88 0-12.853-4.973-12.853-14.093V36.907z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M230.266 61.374s-5.387 7.053-17 7.053a21.149 21.149 0 11-.413-42.293c11.613 0 19.907 9.12 19.907 20.32a25.97 25.97 0 01-.413 4.56h-30.268c1 4.56 4.973 8.707 11.613 8.707a15.411 15.411 0 0011.2-5.053zm-7.867-18.24c-1.24-4.56-4.56-7.88-9.947-7.88-5.8 0-9.12 3.32-10.36 7.88z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M240.213 26.96h9.533v5.8h.413s4.147-6.64 11.613-6.64h1.653v10.36a11.485 11.485 0 00-3.32-.413c-5.8 0-10.36 4.56-10.36 11.613v19.907h-9.532z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M270.48 9.547h9.533V32.76h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.413v24.054h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.533V9.547z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M314.173 74.64a10.518 10.518 0 004.973 1.24c3.733 0 5.64-2.16 7.053-5.387l1.24-2.907-16.173-40.626h10.36l10.79 28.2h.413l10.36-28.2h10.36l-17.416 44.36c-3.4 8.707-7.88 13.68-14.933 13.68a21.445 21.445 0 01-7.053-1.24v-9.12z"
                  fill="#9ca3af"
                ></path>
                <path
                  d="M358.533 26.96h9.533v5.8h.413s3.733-6.64 13.267-6.64 18.253 8.72 18.253 21.16-8.706 21.15-18.239 21.15-13.267-6.64-13.267-6.64h-.413V85h-9.533V26.96zm31.933 20.32a11.207 11.207 0 10-22.4 0 11.207 11.207 0 1022.4 0z"
                  fill="#9ca3af"
                ></path>
              </g>
            </g>
          </svg>
        </motion.div>
      </section>
    </div>
  );
}
