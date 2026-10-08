"use client";

import React from "react";
import { X, Clock, Award, ShieldAlert, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import type { GraphNode } from "../../types/graph.ts";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  onMarkKnown: (nodeId: string, skillId?: string) => Promise<void>;
  onStartQuest: (nodeId: string) => Promise<void>;
  isUpdating?: boolean;
}

export function NodeDetailPanel({
  node,
  onClose,
  onMarkKnown,
  onStartQuest,
  isUpdating = false,
}: NodeDetailPanelProps) {
  if (!node) return null;

  const isLocked = node.status === "LOCKED";
  const isAvailable = node.status === "AVAILABLE";
  const isInProgress = node.status === "IN_PROGRESS";
  const isDone = node.status === "COMPLETED" || node.status === "ALREADY_KNOWN" || node.status === "MASTERED";

  return (
    <aside
      className="w-full sm:w-96 border-l border-[#1B1E21] bg-[#0B0D0F] flex flex-col h-full overflow-y-auto select-none"
      aria-label="Node Details"
    >
      {/* Header */}
      <div className="p-5 border-b border-[#1B1E21] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#85898F]">
            {node.type} DETAIL
          </span>
          <h2 className="text-lg font-bold text-[#F2F2EE] leading-tight mt-0.5">
            {node.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#85898F] hover:text-[#F2F2EE] hover:bg-[#101316] transition-colors"
          aria-label="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Status & Hours Bar */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-full bg-[#101316] border border-[#2A2F33] text-[#F2F2EE] flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDone
                  ? "bg-[#8DDC9A]"
                  : isAvailable
                  ? "bg-[#D8FF5A]"
                  : isInProgress
                  ? "bg-[#8EA7FF]"
                  : "bg-[#5D6268]"
              }`}
            />
            <span>{node.status}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[#101316] border border-[#1B1E21] text-[#85898F] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5D6268]" />
            <span>{node.estimatedHours}h effort</span>
          </div>
        </div>

        {/* Why This Matters / Description */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#5D6268] mb-2">
            Why This Matters
          </h3>
          <p className="text-sm text-[#85898F] leading-relaxed">
            {(node.metadata?.rationale as string) ||
              node.description ||
              "Foundational skill required to reach target role proficiency standards."}
          </p>
        </div>

        {/* Blockers / Prerequisites */}
        {isLocked && node.blockedBy && node.blockedBy.length > 0 && (
          <div className="p-3.5 rounded-lg bg-[#FF7C7C]/10 border border-[#FF7C7C]/30 text-xs">
            <div className="flex items-center gap-1.5 text-[#FF7C7C] font-mono font-semibold mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Prerequisites Required</span>
            </div>
            <p className="text-[#85898F] leading-relaxed">
              This node is currently blocked. You must complete its prerequisite skills (
              <span className="text-[#F2F2EE] font-mono">{node.blockedBy.join(", ")}</span>
              ) before starting.
            </p>
          </div>
        )}

        {/* Proficiency Target */}
        {node.requiredProficiency > 0 && (
          <div className="p-3.5 rounded-lg bg-[#101316] border border-[#1B1E21]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#85898F]">Proficiency Requirement</span>
              <span className="text-[#D8FF5A] font-bold">Level {node.requiredProficiency} / 5</span>
            </div>
            <div className="w-full h-1.5 bg-[#1B1E21] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D8FF5A]"
                style={{ width: `${(node.requiredProficiency / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-5 border-t border-[#1B1E21] bg-[#050607] flex flex-col gap-2.5">
        {!isDone && (
          <button
            disabled={isUpdating}
            onClick={() => onMarkKnown(node.id, node.skillId)}
            className="w-full py-2.5 rounded-lg border border-[#2A2F33] bg-[#101316] hover:bg-[#1B1E21] text-xs font-mono text-[#F2F2EE] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-[#8DDC9A]" />
            <span>I Already Know This</span>
          </button>
        )}

        {isAvailable && (
          <button
            disabled={isUpdating}
            onClick={() => onStartQuest(node.id)}
            className="w-full py-2.5 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>Start Practice Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isInProgress && (
          <button
            disabled={isUpdating}
            onClick={() => onStartQuest(node.id)}
            className="w-full py-2.5 rounded-lg bg-[#8EA7FF] hover:bg-[#8EA7FF]/90 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>Open Quest Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isDone && (
          <div className="text-center py-2 text-xs font-mono text-[#8DDC9A] flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Milestone Satisfied</span>
          </div>
        )}
      </div>
    </aside>
  );
}
