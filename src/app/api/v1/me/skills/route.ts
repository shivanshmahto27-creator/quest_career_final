/**
 * GET /api/v1/me/skills
 * Source: API_SPECIFICATION §16
 */

import { getAuthUser } from "../../../../../lib/auth/session.ts";
import { apiSuccess, apiError } from "../../../../../lib/api/response.ts";
import { getUserSkills } from "../../../../../modules/skill/service.ts";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    const skills = await getUserSkills(user.id);
    return apiSuccess(skills);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("USER_SKILLS_READ_ERROR", msg, 500);
  }
}
