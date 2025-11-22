"use client";
import {createContext, useContext, useState} from "react";
import {GameEngine} from "@/game/main-engine";

const GameEngineContext = createContext<GameEngine | null>(null);

export function GameEngineProvider({children}: {children: React.ReactNode}) {
  const [engine] = useState(() => new GameEngine());
  return (
    <GameEngineContext.Provider value={engine}>
      {children}
    </GameEngineContext.Provider>
  );
}

export function useGameEngine() {
  return useContext(GameEngineContext);
}
