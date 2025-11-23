import {StateModel} from "@/game/models/state-model";
import {Briefcase, CreditCard, Users} from "lucide-react";
import {Badge} from "@/components/ui/badge";

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
    <div className="grid grid-cols-2 gap-4 items-center">
      <div>
        <p className="text-xs text-gray-600">Current Age</p>
        <p className="text-sm font-semibold">{state?.age ?? 0} years</p>

        <div className="border-t mt-4 pt-3 flex items-center gap-2">
          <Briefcase size={14} className="text-gray-500" />
          <p className="text-xs text-gray-600">
            {state?.occupation?.occupationTitle || "Occupation"}
          </p>
        </div>
        {state?.occupation?.yearlySalaryInEuro !== undefined && (
          <div className="mt-1 flex items-center gap-2">
            <CreditCard size={14} className="text-gray-400" />
            <p className="text-xs text-gray-600">
              €
              {Math.round(state.occupation.yearlySalaryInEuro).toLocaleString(
                "de-DE"
              )}{" "}
              / year
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <Badge className="flex items-center gap-2">
            <Users size={14} />
            <span className="text-xs">
              {state.amountOfChildren}{" "}
              {state.amountOfChildren === 1 ? "child" : "children"}
            </span>
          </Badge>

          <Badge variant={state.married ? "secondary" : "outline"}>
            {state.married ? "Married" : "Single"}
          </Badge>
        </div>
      </div>
      <div
        className="flex items-center justify-center text-7xl leading-none"
        aria-hidden
      >
        <span>{emoji}</span>
      </div>
    </div>
  );
}
