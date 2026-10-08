/**
 * Career Quest — Typed API Client
 * Source: FRONTEND_ARCHITECTURE_SPECIFICATION §24-§25
 */

import type { StoredQuest } from "../../modules/quest/service.ts";
import type { StoredConversation, StoredProposal } from "../../modules/assistant/service.ts";

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const json: ApiResponse<T> = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Request failed with status ${res.status}`);
  }

  if (json.data === undefined) {
    throw new Error("API response missing data envelope.");
  }

  return json.data;
}

export const questApi = {
  async get(questId: string): Promise<StoredQuest> {
    return request<StoredQuest>(`/api/v1/quests/${encodeURIComponent(questId)}`);
  },

  async createForNode(roadmapId: string, nodeId: string): Promise<StoredQuest> {
    return request<StoredQuest>(
      `/api/v1/roadmap/${encodeURIComponent(roadmapId)}/nodes/${encodeURIComponent(nodeId)}/quest`,
      { method: "POST" }
    );
  },

  async complete(
    questId: string,
    evidence?: { evidenceType?: string; evidenceUrl?: string }
  ): Promise<{
    quest: StoredQuest;
    nodesUnlocked: string[];
    roadmap: unknown;
  }> {
    return request(
      `/api/v1/quests/${encodeURIComponent(questId)}/complete`,
      {
        method: "POST",
        body: JSON.stringify(evidence || {}),
      }
    );
  },
};

export const assistantApi = {
  async createConversation(roadmapId: string): Promise<StoredConversation> {
    return request<StoredConversation>("/api/v1/assistant/conversations", {
      method: "POST",
      body: JSON.stringify({ roadmapId }),
    });
  },

  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<{
    reply: string;
    proposal?: StoredProposal;
  }> {
    return request(
      `/api/v1/assistant/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );
  },

  async confirmProposal(proposalId: string): Promise<{
    proposal: StoredProposal;
    result: unknown;
  }> {
    return request(
      `/api/v1/assistant/proposals/${encodeURIComponent(proposalId)}/confirm`,
      {
        method: "POST",
      }
    );
  },
};
