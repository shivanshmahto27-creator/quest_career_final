"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Send,
  Loader2,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { assistantApi } from "../../lib/api/client.ts";
import type { StoredConversation, StoredProposal } from "../../modules/assistant/service.ts";

export default function AssistantPage() {
  const [conversation, setConversation] = useState<StoredConversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        let resolvedRoadmapId = urlParams?.get("roadmapId") || urlParams?.get("id");

        if (!resolvedRoadmapId) {
          try {
            const rmRes = await fetch("/api/v1/roadmap");
            if (rmRes.ok) {
              const rmJson = await rmRes.json();
              resolvedRoadmapId = rmJson.data?.id;
            }
          } catch {
            // Ignore fetch error, will fallback
          }
        }

        const conv = await assistantApi.createConversation(resolvedRoadmapId || "default");
        setConversation(conv);
      } catch (err: unknown) {
        console.error("Failed to initialize conversation", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, conversation?.proposals]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || !conversation || loading) return;

    setInputMessage("");
    setLoading(true);

    try {
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
    } catch (err: unknown) {
      console.error("Failed to confirm proposal", err);
    } finally {
      setConfirmingId(null);
    }
  };

  const quickPrompts = [
    "I already know JavaScript",
    "Why is my Next Best Action recommended?",
    "What milestones unlock next?",
  ];

  return (
    <main className="min-h-screen bg-[#050607] text-[#F2F2EE] flex flex-col" id="assistant-page">
      {/* Top Banner Navigation */}
      <nav className="border-b border-[#1B1E21] bg-[#0B0D0F]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/roadmap"
            className="flex items-center gap-2 text-xs font-mono text-[#85898F] hover:text-[#F2F2EE] transition-colors px-2 py-1 rounded hover:bg-[#101316]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Career Graph</span>
          </Link>
          <span className="text-[#2A2F33] hidden sm:inline">|</span>
          <span className="text-[11px] font-mono text-[#5D6268] tracking-widest uppercase hidden sm:inline">
            Career AI Assistant
          </span>
        </div>

        <Link
          href="/roadmap"
          className="text-xs font-mono text-[#D8FF5A] hover:underline flex items-center gap-1"
        >
          <span>View Active Roadmap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col p-4 sm:p-6">
        {/* Messages Container */}
        <div className="flex-1 bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {conversation?.messages.map((msg) => {
            const isUser = msg.role === "USER";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isUser
                      ? "bg-[#1B1E21] text-[#85898F]"
                      : "bg-[#D8FF5A]/15 text-[#D8FF5A] border border-[#D8FF5A]/30"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
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
              className="p-5 rounded-xl bg-[#101316] border border-[#D8FF5A]/40 text-[#F2F2EE] flex flex-col gap-3 my-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D8FF5A] flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Roadmap Proposal
                </span>
                <span
                  className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${
                    prop.status === "CONFIRMED"
                      ? "bg-[#8DDC9A]/15 text-[#8DDC9A] border border-[#8DDC9A]/30"
                      : "bg-[#E7C85C]/15 text-[#E7C85C] border border-[#E7C85C]/30"
                  }`}
                >
                  {prop.status}
                </span>
              </div>

              <p className="text-sm text-[#85898F] leading-relaxed">
                {prop.explanation}
              </p>

              {prop.status === "PENDING" && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={confirmingId === prop.id}
                    onClick={() => handleConfirmProposal(prop.id)}
                    className="py-2.5 px-4 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {confirmingId === prop.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirm Proposal</span>
                  </button>
                </div>
              )}

              {prop.status === "CONFIRMED" && (
                <div className="text-xs font-mono text-[#8DDC9A] flex items-center gap-2 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reroute executed! Head to the Roadmap to see your unlocked path.</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#85898F] p-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#D8FF5A]" />
              <span>Analyzing career roadmap...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs font-mono whitespace-nowrap px-3 py-1.5 rounded-full bg-[#101316] hover:bg-[#1B1E21] border border-[#1B1E21] text-[#85898F] hover:text-[#F2F2EE] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3 pt-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your skills, requirements, or proposals..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#101316] border border-[#2A2F33] text-sm font-mono text-[#F2F2EE] placeholder-[#5D6268] focus:border-[#D8FF5A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </main>
  );
}
