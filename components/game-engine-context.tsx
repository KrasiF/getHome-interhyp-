"use client";
import {createContext, useContext, useState} from "react";
import {GameEngine} from "@/game/main-engine";
import {createMockedGameEngine} from "@/game/mocked-main-engine";

type GameEngineContextType = {
  engine: GameEngine;
  triggerUpdate: () => void;
};

const GameEngineContext = createContext<GameEngineContextType>({
  engine: createMockedGameEngine(),
  triggerUpdate: () => {},
});

export function GameEngineProvider({children}: {children: React.ReactNode}) {
  const [engine] = useState(createMockedGameEngine());
  const [, setUpdateCounter] = useState(0);

  const triggerUpdate = () => {
    setUpdateCounter((prev) => prev + 1);
  };

  return (
    <GameEngineContext.Provider value={{engine, triggerUpdate}}>
      {children}
    </GameEngineContext.Provider>
  );
}

export function useGameEngine() {
  return useContext(GameEngineContext);
}
