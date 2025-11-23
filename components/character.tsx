import {StateModel} from "@/game/models/state-model";

function satisfactionEmoji(score?: number) {
  if (typeof score !== "number") return "😐";
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= 10) return "😭";
  if (s <= 30) return "😟";
  if (s <= 50) return "😐";
  if (s <= 70) return "🙂";
  if (s <= 90) return "😃";
  return "🤩";
}

export default function Character({state}: {state: StateModel}) {
  const emoji = satisfactionEmoji(state.lifeSatisfactionFrom1To100);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="text-6xl leading-none" aria-hidden>
        {emoji}
      </div>
    </div>
  );
}
