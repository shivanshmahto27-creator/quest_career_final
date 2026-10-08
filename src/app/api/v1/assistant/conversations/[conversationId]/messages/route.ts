/**
 * POST /api/v1/assistant/conversations/:conversationId/messages
 * Source: API_SPECIFICATION §28
 */

import { getAuthUser } from "../../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../../lib/api/response.ts";
import { sendMessage } from "../../../../../../../modules/assistant/service.ts";

export async function POST(
  req: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { conversationId } = await context.params;
    const body = await req.json();

    if (!body.content || typeof body.content !== "string") {
      return apiError("VALIDATION_ERROR", "Message content is required", 400);
    }

    const result = await sendMessage(user.id, conversationId, body.content);
    return apiSuccess(result, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("MESSAGE_FAILED", msg, 400);
  }
}
