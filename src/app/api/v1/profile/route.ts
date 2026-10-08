/**
 * GET /api/v1/profile
 * PATCH /api/v1/profile
 * Source: API_SPECIFICATION §12-§13
 */

import { getAuthUser } from "../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../lib/api/response.ts";
import { DEMO_PROFILE } from "../../../../lib/db/fixtures.ts";

let activeProfile = { ...DEMO_PROFILE };

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    return apiSuccess({
      id: activeProfile.id,
      userId: user.id,
      targetRole: activeProfile.targetRole,
      targetSpecialization: activeProfile.targetSpecialization,
      weeklyHours: activeProfile.weeklyHours,
      experienceSummary: activeProfile.experienceSummary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("PROFILE_READ_ERROR", msg, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (body.targetRole && typeof body.targetRole !== "string") {
      return apiError("VALIDATION_ERROR", "targetRole must be a non-empty string", 400);
    }

    activeProfile = {
      ...activeProfile,
      ...body,
      userId: user.id,
    };

    return apiSuccess({
      profile: activeProfile,
      roadmapImpact: {
        requiresRegeneration: true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("PROFILE_UPDATE_ERROR", msg, 400);
  }
}
