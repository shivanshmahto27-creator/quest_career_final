/**
 * POST /api/v1/roadmap/:roadmapId/reroute
 * Source: API_SPECIFICATION §22
 */

import { getAuthUser } from "../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../lib/api/response.ts";
import { rerouteRoadmap } from "../../../../../../modules/roadmap/service.ts";

export async function POST(
  req: Request,
  context: { params: Promise<{ roadmapId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { roadmapId } = await context.params;
    const body = await req.json();

    if (!body.skillId || body.proficiency === undefined) {
      return apiError("VALIDATION_ERROR", "skillId and proficiency are required for rerouting", 400);
    }

    const updated = await rerouteRoadmap(user.id, roadmapId, {
      skillId: body.skillId,
      proficiency: Number(body.proficiency),
      isKnown: body.isKnown,
    });

    return apiSuccess(updated, 200, { revision: updated.revision });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("REROUTE_FAILED", msg, 400);
  }
}
