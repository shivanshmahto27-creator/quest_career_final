/**
 * GET /api/v1/health
 * Source: DEPLOYMENT_AND_HACKATHON_RUNBOOK §17
 * Health check endpoint confirming application and API readiness.
 */

import { apiSuccess } from "../../../../lib/api/response.ts";

export async function GET() {
  return apiSuccess({
    status: "ok",
    version: "1.1.0",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
