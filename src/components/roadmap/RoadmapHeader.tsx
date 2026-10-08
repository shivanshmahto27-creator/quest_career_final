"use client";

import React from "react";
import { Clock, Calendar, CheckCircle2, Filter, Sparkles } from "lucide-react";
import type { TimelineSummary } from "../../types/graph.ts";

interface RoadmapHeaderProps {
  targetRole: string;
  timeline: TimelineSummary;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenAssistant?: () => void;
}

export function RoadmapHeader({
  targetRole,
  timeline,
  activeFilter,
  onFilterChange,
  onOpenAssistant,
}: RoadmapHeaderProps) {
  const filterOptions = ["ALL", "AVAILABLE", "IN_PROGRESS", "COMPLETED", "LOCKED"];

  return (
    <div className="border-b border-[#1B1E21] bg-[#0B0D0F] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8FF5A]">
            Active Goal
          </span>
          <span className="text-[#5D6268] text-xs">•</span>
          <span className="text-[11px] font-mono text-[#85898F]">
            {timeline.weeklyHours}h / week pace
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#F2F2EE] tracking-tight">
          {targetRole}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {/* Progress & Timeline Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#85898F]">
            <Clock className="w-3.5 h-3.5 text-[#5D6268]" />
            <span>
              <strong className="text-[#F2F2EE]">{timeline.remainingHours}h</strong> left
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#85898F]">
            <Calendar className="w-3.5 h-3.5 text-[#5D6268]" />
            <span>
              <strong className="text-[#F2F2EE]">
                {timeline.minWeeks === timeline.maxWeeks
                  ? `${timeline.minWeeks}w`
                  : `${timeline.minWeeks}–${timeline.maxWeeks}w`}
              </strong> est.
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="flex-1 h-2 bg-[#1B1E21] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D8FF5A] rounded-full transition-all duration-500"
                style={{ width: `${timeline.progressPercentage}%` }}
              />
            </div>
            <span className="text-[#F2F2EE] font-bold">
              {timeline.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 border-l border-[#1B1E21] pl-4">
          <Filter className="w-3.5 h-3.5 text-[#5D6268] mr-1 hidden sm:block" />
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => onFilterChange(opt)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                activeFilter === opt
                  ? "bg-[#D8FF5A] text-black font-semibold"
                  : "bg-[#101316] text-[#85898F] hover:text-[#F2F2EE] border border-[#1B1E21]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Assistant Drawer Trigger */}
        {onOpenAssistant && (
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101316] hover:bg-[#1B1E21] border border-[#D8FF5A]/30 text-xs font-mono text-[#D8FF5A] transition-colors cursor-pointer"
            id="roadmap-assistant-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        )}
      </div>
    </div>
  );
}
