/**
 * POST /api/v1/demo/reset
 * Source: DEPLOYMENT_AND_HACKATHON_RUNBOOK §33
 * Restores demo account state to known valid baseline for testing & live judging.
 */

import { getAuthUser } from "../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { createRoadmap } from "../../../../../modules/roadmap/service.ts";
import { DEMO_PROFILE } from "../../../../../lib/db/fixtures.ts";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);

    // Reinitialize fresh default roadmap for demo user
    const roadmap = await createRoadmap(user.id, {
      targetRole: DEMO_PROFILE.targetRole,
      weeklyHours: DEMO_PROFILE.weeklyHours,
      targetSpecialization: DEMO_PROFILE.targetSpecialization,
      currentSkills: [],
    });

    return apiSuccess({
      message: "Demo state successfully reset to canonical baseline.",
      userId: user.id,
      roadmap,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset demo state";
    return apiError("DEMO_RESET_ERROR", msg, 500);
  }
}
