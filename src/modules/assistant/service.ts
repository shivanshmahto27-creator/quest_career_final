/**
 * Career Quest — Assistant Feature Service
 * Source: BACKEND_ARCHITECTURE_SPECIFICATION §9, API_SPECIFICATION §28-§29
 */

import { updateUserSkill } from "../skill/service.ts";

export interface StoredProposal {
  id: string;
  conversationId: string;
  roadmapId: string;
  proposalType: "UPDATE_PROFICIENCY" | "ADD_SKILL" | "REGENERATE_ROADMAP";
  payload: Record<string, unknown>;
  explanation: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
}

export interface StoredConversation {
  id: string;
  userId: string;
  roadmapId: string;
  messages: Array<{
    id: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    createdAt: string;
  }>;
  proposals: StoredProposal[];
  createdAt: string;
}

const globalAssistantStore = globalThis as unknown as {
  __careerQuestConversationStore?: Map<string, StoredConversation>;
  __careerQuestProposalStore?: Map<string, StoredProposal>;
};

if (!globalAssistantStore.__careerQuestConversationStore) {
  globalAssistantStore.__careerQuestConversationStore = new Map<string, StoredConversation>();
}
if (!globalAssistantStore.__careerQuestProposalStore) {
  globalAssistantStore.__careerQuestProposalStore = new Map<string, StoredProposal>();
}

export const conversationStore = globalAssistantStore.__careerQuestConversationStore;
export const proposalStore = globalAssistantStore.__careerQuestProposalStore;

export async function createConversation(
  userId: string,
  roadmapId: string
): Promise<StoredConversation> {
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const stored: StoredConversation = {
    id: convId,
    userId,
    roadmapId,
    messages: [
      {
        id: `msg_init`,
        role: "ASSISTANT",
        content: "Hello Alex! I am your Career Quest Assistant. How can I help adapt or optimize your roadmap?",
        createdAt: new Date().toISOString(),
      },
    ],
    proposals: [],
    createdAt: new Date().toISOString(),
  };

  conversationStore.set(convId, stored);
  return stored;
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string
): Promise<{
  reply: string;
  proposal?: StoredProposal;
}> {
  const conv = conversationStore.get(conversationId);
  if (!conv || conv.userId !== userId) {
    throw new Error(`Conversation '${conversationId}' not found.`);
  }

  // Record user message
  conv.messages.push({
    id: `msg_${Date.now()}_u`,
    role: "USER",
    content,
    createdAt: new Date().toISOString(),
  });

  let replyText = `I analyzed your request: "${content}". Based on your target role progress, your momentum looks great.`;
  let proposal: StoredProposal | undefined;

  // If user declares knowing a skill, generate a structured confirmation proposal
  if (content.toLowerCase().includes("already know") || content.toLowerCase().includes("know javascript")) {
    const propId = `prop_${Date.now()}`;
    proposal = {
      id: propId,
      conversationId,
      roadmapId: conv.roadmapId,
      proposalType: "UPDATE_PROFICIENCY",
      payload: {
        skillId: "javascript",
        proficiency: 3,
      },
      explanation: "Mark JavaScript as Proficient (Level 3) and unlock downstream React dependencies.",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    proposalStore.set(propId, proposal);
    conv.proposals.push(proposal);
    replyText = `It looks like you already know JavaScript! Would you like me to update your proficiency to Proficient and unlock dependent React milestones?`;
  }

  // Record assistant response
  conv.messages.push({
    id: `msg_${Date.now()}_a`,
    role: "ASSISTANT",
    content: replyText,
    createdAt: new Date().toISOString(),
  });

  return {
    reply: replyText,
    proposal,
  };
}

export async function confirmProposal(
  userId: string,
  proposalId: string
): Promise<{
  proposal: StoredProposal;
  result: unknown;
}> {
  const proposal = proposalStore.get(proposalId);
  if (!proposal) {
    throw new Error(`Proposal '${proposalId}' not found.`);
  }

  proposal.status = "CONFIRMED";

  let result = null;
  if (proposal.proposalType === "UPDATE_PROFICIENCY") {
    const skillId = (proposal.payload.skillId as string) || "javascript";
    const proficiency = Number(proposal.payload.proficiency) || 3;
    result = await updateUserSkill(userId, skillId, proficiency, "ALREADY_KNOWN");
  }

  return {
    proposal,
    result,
  };
}
