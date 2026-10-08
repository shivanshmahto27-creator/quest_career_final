"use client";

import React from "react";
import { Sparkles, ArrowRight, Clock, Target, Play } from "lucide-react";
import type { NextBestAction } from "../../types/graph.ts";

interface NextBestActionCardProps {
  action: NextBestAction | null;
  onFocusNode: (nodeId: string) => void;
  onStartQuest?: (nodeId: string) => void;
  isUpdating?: boolean;
}

export function NextBestActionCard({
  action,
  onFocusNode,
  onStartQuest,
  isUpdating = false,
}: NextBestActionCardProps) {
  if (!action) return null;

  return (
    <div className="bg-[#101316] border border-[#D8FF5A]/40 rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#D8FF5A]/15 border border-[#D8FF5A]/30 flex items-center justify-center shrink-0 text-[#D8FF5A]">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8FF5A] font-bold">
              Next Best Action
            </span>
            <span className="text-[#5D6268] text-xs">•</span>
            <span className="text-[11px] font-mono text-[#85898F] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#5D6268]" />
              {action.estimatedHours}h
            </span>
          </div>

          <h3 className="text-base font-bold text-[#F2F2EE] leading-tight mb-1">
            {action.title}
          </h3>

          <p className="text-xs text-[#85898F] leading-relaxed max-w-xl">
            {action.reason}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={() => onFocusNode(action.nodeId)}
          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#0B0D0F] hover:bg-[#1B1E21] border border-[#2A2F33] text-[#85898F] hover:text-[#F2F2EE] text-xs font-mono transition-colors text-center cursor-pointer"
        >
          Inspect
        </button>

        {onStartQuest && (
          <button
            disabled={isUpdating}
            onClick={() => onStartQuest(action.nodeId)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-[0_2px_12px_rgba(216,255,90,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Start Quest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
