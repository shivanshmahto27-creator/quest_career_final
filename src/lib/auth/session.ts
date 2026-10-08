/**
 * Career Quest — Authentication & Session Utility
 * Source: API_SPECIFICATION_Career_Quest_v1.1_FINAL.md §5, BACKEND_ARCHITECTURE_SPECIFICATION §13
 */

import { DEMO_USER } from "../db/fixtures.ts";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Derives authenticated user from request session.
 * For hackathon MVP, returns default authenticated demo user session
 * or bearer token resolution.
 */
export async function getAuthUser(request?: Request): Promise<AuthUser> {
  const authHeader = request?.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer test-user-")) {
    const id = authHeader.replace("Bearer ", "");
    return {
      id,
      email: `${id}@careerquest.dev`,
      name: `User ${id}`,
    };
  }

  // Default authenticated user session for hackathon MVP
  return DEMO_USER;
}
