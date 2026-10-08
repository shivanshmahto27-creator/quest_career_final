/**
 * GET /api/v1/skills/:skillId
 * Source: API_SPECIFICATION §15
 */

import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { getSkill } from "../../../../../modules/skill/service.ts";

export async function GET(
  _req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await context.params;
    const skill = await getSkill(skillId);
    if (!skill) {
      return apiError("SKILL_NOT_FOUND", `Skill '${skillId}' not found`, 404);
    }
    return apiSuccess(skill);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("SKILL_READ_ERROR", msg, 500);
  }
}
