/**
 * GET /api/v1/roadmap/:roadmapId
 * Source: API_SPECIFICATION §22
 */

import { getAuthUser } from "../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { getRoadmap } from "../../../../../modules/roadmap/service.ts";

export async function GET(
  req: Request,
  context: { params: Promise<{ roadmapId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { roadmapId } = await context.params;
    const roadmap = await getRoadmap(user.id, roadmapId);

    if (!roadmap) {
      return apiError("ROADMAP_NOT_FOUND", `Roadmap '${roadmapId}' not found`, 404);
    }

    return apiSuccess(roadmap, 200, { revision: roadmap.revision });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("ROADMAP_READ_ERROR", msg, 500);
  }
}
