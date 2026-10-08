/**
 * POST /api/v1/roadmap
 * GET  /api/v1/roadmap
 * Source: API_SPECIFICATION §18-§21
 */

import { getAuthUser } from "../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../lib/api/response.ts";
import { createRoadmap, getRoadmap } from "../../../../modules/roadmap/service.ts";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.targetRole || typeof body.targetRole !== "string") {
      return apiError("VALIDATION_ERROR", "targetRole is required", 400);
    }

    const weeklyHours = Number(body.weeklyHours) || 10;
    const roadmap = await createRoadmap(user.id, {
      targetRole: body.targetRole,
      weeklyHours,
      currentSkills: body.currentSkills,
      targetSpecialization: body.targetSpecialization,
      targetCompanyType: body.targetCompanyType,
    });

    return apiSuccess(roadmap, 201, { revision: roadmap.revision });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("ROADMAP_GENERATION_FAILED", msg, 422);
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const roadmap = await getRoadmap(user.id);
    if (!roadmap) {
      return apiError("ROADMAP_NOT_FOUND", "No active roadmap found for user", 404);
    }
    return apiSuccess(roadmap, 200, { revision: roadmap.revision });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("ROADMAP_READ_ERROR", msg, 500);
  }
}
