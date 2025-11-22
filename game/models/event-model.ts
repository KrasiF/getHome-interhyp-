
// if interactive: user can decide between impact (= yes, event shall be applied) and alternativeImpact (= no, event shall not be applied)
// if not interactive: alternativeImpact and eventQuestion are null

import type { EventImpactModel } from "./event-impact-model";

export interface EventModel {
    impact: EventImpactModel;
    alternativeImpact: EventImpactModel | null;

    eventDescription: string;
    eventQuestion: string | null;
}