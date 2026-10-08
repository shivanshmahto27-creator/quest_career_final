/**
 * GET /api/v1/quests/:questId
 * Source: API_SPECIFICATION §24
 */

import { getAuthUser } from "../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { getQuest } from "../../../../../modules/quest/service.ts";

export async function GET(
  req: Request,
  context: { params: Promise<{ questId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { questId } = await context.params;

    const quest = await getQuest(user.id, questId);
    if (!quest) {
      return apiError("QUEST_NOT_FOUND", `Quest '${questId}' not found`, 404);
    }

    return apiSuccess(quest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("QUEST_READ_ERROR", msg, 500);
  }
}
