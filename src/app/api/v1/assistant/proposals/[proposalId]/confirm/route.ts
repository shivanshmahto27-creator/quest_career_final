/**
 * POST /api/v1/assistant/proposals/:proposalId/confirm
 * Source: API_SPECIFICATION §29
 */

import { getAuthUser } from "../../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../../lib/api/response.ts";
import { confirmProposal } from "../../../../../../../modules/assistant/service.ts";

export async function POST(
  req: Request,
  context: { params: Promise<{ proposalId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { proposalId } = await context.params;

    const result = await confirmProposal(user.id, proposalId);
    return apiSuccess(result, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("PROPOSAL_CONFIRM_FAILED", msg, 400);
  }
}
