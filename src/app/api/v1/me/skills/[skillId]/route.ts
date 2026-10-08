/**
 * PATCH /api/v1/me/skills/:skillId
 * Source: API_SPECIFICATION §17
 */

import { getAuthUser } from "../../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../../lib/api/response.ts";
import { updateUserSkill } from "../../../../../../modules/skill/service.ts";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { skillId } = await context.params;
    const body = await req.json();

    const proficiency = Number(body.proficiency);
    if (isNaN(proficiency) || proficiency < 0 || proficiency > 5) {
      return apiError("VALIDATION_ERROR", "Proficiency must be an integer between 0 and 5", 400);
    }

    // Check optional If-Match revision header
    const ifMatch = req.headers.get("If-Match");
    const expectedRevision = ifMatch ? parseInt(ifMatch, 10) : undefined;

    const result = await updateUserSkill(
      user.id,
      skillId,
      proficiency,
      body.status || "ACTIVE",
      expectedRevision
    );

    return apiSuccess(result, 200, { revision: result.skill.revision });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.includes("[CONFLICT]") ? 409 : 400;
    return apiError("SKILL_UPDATE_ERROR", msg, status);
  }
}
