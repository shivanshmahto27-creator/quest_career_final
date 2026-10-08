"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Loader2,
  HelpCircle,
  Cpu,
} from "lucide-react";
import { assistantApi } from "../../lib/api/client.ts";
import type { StoredConversation, StoredProposal } from "../../modules/assistant/service.ts";

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId?: string;
  onRoadmapUpdated?: () => void;
}

export function AssistantDrawer({
  isOpen,
  onClose,
  roadmapId = "roadmap_default",
  onRoadmapUpdated,
}: AssistantDrawerProps) {
  const [conversation, setConversation] = useState<StoredConversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!isOpen) return;

    async function init() {
      if (conversation) return;
      try {
        setLoading(true);
        const conv = await assistantApi.createConversation(roadmapId);
        setConversation(conv);
      } catch (err: unknown) {
        console.error("Failed to initialize conversation", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isOpen, roadmapId, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, conversation?.proposals]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || !conversation || loading) return;

    setInputMessage("");
    setLoading(true);

    try {
      // Optimistically add user message
      const tempUserMsg = {
        id: `temp_${Date.now()}`,
        role: "USER" as const,
        content: text,
        createdAt: new Date().toISOString(),
      };

      setConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, tempUserMsg],
            }
          : null
      );

      const res = await assistantApi.sendMessage(conversation.id, text);

      setConversation((prev) => {
        if (!prev) return null;
        const newMessages = [
          ...prev.messages.filter((m) => m.id !== tempUserMsg.id),
          {
            id: `msg_u_${Date.now()}`,
            role: "USER" as const,
            content: text,
            createdAt: new Date().toISOString(),
          },
          {
            id: `msg_a_${Date.now()}`,
            role: "ASSISTANT" as const,
            content: res.reply,
            createdAt: new Date().toISOString(),
          },
        ];

        const newProposals = res.proposal
          ? [...prev.proposals, res.proposal]
          : prev.proposals;

        return {
          ...prev,
          messages: newMessages,
          proposals: newProposals,
        };
      });
    } catch (err: unknown) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProposal = async (proposalId: string) => {
    try {
      setConfirmingId(proposalId);
      await assistantApi.confirmProposal(proposalId);

      setConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          proposals: prev.proposals.map((p) =>
            p.id === proposalId ? { ...p, status: "CONFIRMED" } : p
          ),
        };
      });

      // Notify parent to refresh graph
      onRoadmapUpdated?.();
    } catch (err: unknown) {
      console.error("Failed to confirm proposal", err);
    } finally {
      setConfirmingId(null);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "I already know JavaScript",
    "Why is my Next Best Action recommended?",
    "What milestones unlock next?",
  ];

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0B0D0F] border-l border-[#1B1E21] shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200"
      aria-label="Career AI Assistant"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#1B1E21] bg-[#050607] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D8FF5A]/15 border border-[#D8FF5A]/30 flex items-center justify-center text-[#D8FF5A]">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F2F2EE] leading-tight">
              Career AI Assistant
            </h2>
            <span className="text-[10px] font-mono text-[#85898F]">
              Context-Aware Copilot
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#85898F] hover:text-[#F2F2EE] hover:bg-[#101316] transition-colors"
          aria-label="Close assistant drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {conversation?.messages.map((msg) => {
          const isUser = msg.role === "USER";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? "bg-[#1B1E21] text-[#85898F]"
                    : "bg-[#D8FF5A]/15 text-[#D8FF5A] border border-[#D8FF5A]/30"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-[#101316] text-[#F2F2EE] border border-[#2A2F33] rounded-tr-none"
                    : "bg-[#050607] text-[#F2F2EE] border border-[#1B1E21] rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Structured Proposals */}
        {conversation?.proposals.map((prop) => (
          <div
            key={prop.id}
            className="p-4 rounded-xl bg-[#101316] border border-[#D8FF5A]/40 text-[#F2F2EE] flex flex-col gap-3 my-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D8FF5A] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Roadmap Proposal
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  prop.status === "CONFIRMED"
                    ? "bg-[#8DDC9A]/15 text-[#8DDC9A] border border-[#8DDC9A]/30"
                    : "bg-[#E7C85C]/15 text-[#E7C85C] border border-[#E7C85C]/30"
                }`}
              >
                {prop.status}
              </span>
            </div>

            <p className="text-xs text-[#85898F] leading-relaxed">
              {prop.explanation}
            </p>

            {prop.status === "PENDING" && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  disabled={confirmingId === prop.id}
                  onClick={() => handleConfirmProposal(prop.id)}
                  className="flex-1 py-2 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {confirmingId === prop.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Proposal</span>
                </button>
              </div>
            )}

            {prop.status === "CONFIRMED" && (
              <div className="text-[11px] font-mono text-[#8DDC9A] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reroute executed & applied to graph!</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#85898F] p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D8FF5A]" />
            <span>Analyzing career graph and implications...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-[#1B1E21] bg-[#050607] flex items-center gap-2 overflow-x-auto">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-mono whitespace-nowrap px-2.5 py-1 rounded-full bg-[#101316] hover:bg-[#1B1E21] border border-[#1B1E21] text-[#85898F] hover:text-[#F2F2EE] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-[#1B1E21] bg-[#050607] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about skills, proposals, reroutes..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#101316] border border-[#2A2F33] text-xs font-mono text-[#F2F2EE] placeholder-[#5D6268] focus:border-[#D8FF5A] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-2.5 rounded-xl bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
