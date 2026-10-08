/**
 * POST /api/v1/quests/:questId/complete
 * Source: API_SPECIFICATION §25
 */

import { getAuthUser } from "../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../lib/api/response.ts";
import { completeQuest } from "../../../../../../modules/quest/service.ts";

export async function POST(
  req: Request,
  context: { params: Promise<{ questId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { questId } = await context.params;

    const result = await completeQuest(user.id, questId);
    return apiSuccess(result, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("QUEST_COMPLETION_FAILED", msg, 400);
  }
}
