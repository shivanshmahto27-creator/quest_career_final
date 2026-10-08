/**
 * Career Quest — Unified API Response Envelope Helper
 * Source: API_SPECIFICATION_Career_Quest_v1.1_FINAL.md §7-§9
 */

export interface ApiResponseMeta {
  requestId?: string;
  revision?: number;
  pagination?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta: ApiResponseMeta = {}
): Response {
  const envelope: ApiSuccessEnvelope<T> = {
    data,
    meta: {
      requestId: meta.requestId || `req_${Date.now()}`,
      ...meta,
    },
  };

  return new Response(JSON.stringify(envelope), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): Response {
  const envelope: ApiErrorEnvelope = {
    error: {
      code,
      message,
      details,
      requestId: `req_${Date.now()}`,
    },
  };

  return new Response(JSON.stringify(envelope), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
