/**
 * POST /api/v1/roadmap/:roadmapId/nodes/:nodeId/quest
 * Source: API_SPECIFICATION §23
 */

import { getAuthUser } from "../../../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../../../lib/api/response.ts";
import { createQuestForNode } from "../../../../../../../../modules/quest/service.ts";

export async function POST(
  req: Request,
  context: { params: Promise<{ roadmapId: string; nodeId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { roadmapId, nodeId } = await context.params;

    const quest = await createQuestForNode(user.id, roadmapId, nodeId);
    return apiSuccess(quest, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("QUEST_CREATION_FAILED", msg, 400);
  }
}
