"use client"
import { useGameEngine } from "@/components/game-engine-context";
import { StateModel } from "@/game/models/state-model";

export default function Warpup() {
  const {engine: gameEngine} = useGameEngine();    
const state = gameEngine.getState() as StateModel;
const history = gameEngine.getHistory();
  

    return (null)
}