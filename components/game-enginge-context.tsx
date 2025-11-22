"use client";
import {createContext, useContext, useState} from "react";
import {GameEngine} from "@/game/main-engine";
import {createMockedGameEngine} from "@/game/mocked-main-engine";

const GameEngineContext = createContext<GameEngine>(createMockedGameEngine());

export function GameEngineProvider({children}: {children: React.ReactNode}) {
  const [engine] = useState(createMockedGameEngine());
  return (
    <GameEngineContext.Provider value={engine}>
      {children}
    </GameEngineContext.Provider>
  );
}

export function useGameEngine() {
  return useContext(GameEngineContext);
}
