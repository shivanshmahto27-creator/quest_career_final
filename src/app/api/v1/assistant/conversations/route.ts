/**
 * POST /api/v1/assistant/conversations
 * Source: API_SPECIFICATION §28
 */

import { getAuthUser } from "../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { createConversation } from "../../../../../modules/assistant/service.ts";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    if (!body.roadmapId) {
      return apiError("VALIDATION_ERROR", "roadmapId is required to start an assistant conversation", 400);
    }

    const conversation = await createConversation(user.id, body.roadmapId);
    return apiSuccess(conversation, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("CONVERSATION_CREATE_FAILED", msg, 400);
  }
}
