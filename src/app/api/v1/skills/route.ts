/**
 * GET /api/v1/skills
 * Source: API_SPECIFICATION §14
 */

import { apiSuccess, apiError } from "../../../../lib/api/response.ts";
import { listSkills } from "../../../../modules/skill/service.ts";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || undefined;
    const skills = await listSkills(query);
    return apiSuccess(skills);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return apiError("SKILLS_READ_ERROR", msg, 500);
  }
}
