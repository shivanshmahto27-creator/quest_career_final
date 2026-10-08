"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { Lock, Play, CheckCircle2, Award, Clock } from "lucide-react";
import type { GraphNode, NodeStatus } from "../../types/graph.ts";

export interface SkillNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  type: GraphNode["type"];
  status: NodeStatus;
  requiredProficiency: number;
  currentProficiency: number;
  estimatedHours: number;
  phaseId: string;
  priority: number;
  metadata?: Record<string, unknown>;
  isNextBestAction?: boolean;
  isSelected?: boolean;
}

export type SkillNodeType = Node<SkillNodeData, "skillNode">;

function getStatusStyle(status: NodeStatus) {
  switch (status) {
    case "LOCKED":
      return {
        badgeBg: "bg-[#1B1E21]",
        badgeText: "text-[#85898F]",
        border: "border-[#1B1E21]",
        cardBg: "bg-[#0B0D0F]/70 opacity-70",
        icon: Lock,
      };
    case "AVAILABLE":
      return {
        badgeBg: "bg-[#D8FF5A]/15",
        badgeText: "text-[#D8FF5A]",
        border: "border-[#D8FF5A]/60 shadow-[0_0_12px_rgba(216,255,90,0.15)]",
        cardBg: "bg-[#101316]",
        icon: Play,
      };
    case "IN_PROGRESS":
      return {
        badgeBg: "bg-[#8EA7FF]/20",
        badgeText: "text-[#8EA7FF]",
        border: "border-[#8EA7FF] shadow-[0_0_12px_rgba(142,167,255,0.2)] animate-pulse",
        cardBg: "bg-[#101316]",
        icon: Play,
      };
    case "COMPLETED":
      return {
        badgeBg: "bg-[#8DDC9A]/20",
        badgeText: "text-[#8DDC9A]",
        border: "border-[#8DDC9A]/70",
        cardBg: "bg-[#0B0D0F]",
        icon: CheckCircle2,
      };
    case "ALREADY_KNOWN":
      return {
        badgeBg: "bg-[#8DDC9A]/20",
        badgeText: "text-[#8DDC9A]",
        border: "border-[#2A2F33]",
        cardBg: "bg-[#0B0D0F]",
        icon: CheckCircle2,
      };
    case "MASTERED":
      return {
        badgeBg: "bg-[#E7C85C]/20",
        badgeText: "text-[#E7C85C]",
        border: "border-[#E7C85C]",
        cardBg: "bg-[#101316]",
        icon: Award,
      };
    default:
      return {
        badgeBg: "bg-[#1B1E21]",
        badgeText: "text-[#85898F]",
        border: "border-[#1B1E21]",
        cardBg: "bg-[#0B0D0F]",
        icon: Lock,
      };
  }
}

export const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeType>) => {
  const node = data;
  const style = getStatusStyle(node.status);
  const StatusIcon = style.icon;

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Node ${node.title}, Status: ${node.status}, Estimated: ${node.estimatedHours} hours`}
      className={`w-64 rounded-lg p-3.5 border transition-all text-left relative focus:outline-none focus:ring-2 focus:ring-[#D8FF5A] ${
        style.cardBg
      } ${style.border} ${
        selected ? "ring-2 ring-[#D8FF5A] scale-[1.02]" : "hover:border-[#2A2F33]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[#85898F] !border-none"
      />

      {/* Next Best Action Tag */}
      {node.isNextBestAction && (
        <div className="absolute -top-3 left-3 bg-[#D8FF5A] text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
          Next Best Action
        </div>
      )}

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#85898F]">
          {node.type || "SKILL"}
        </span>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${style.badgeBg} ${style.badgeText}`}
        >
          <StatusIcon className="w-3 h-3 stroke-[2.5]" />
          {node.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-[#F2F2EE] leading-snug mb-2.5">
        {node.title}
      </h3>

      {/* Bottom Metrics Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#85898F] border-t border-[#1B1E21] pt-2">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#5D6268]" />
          <span>{node.estimatedHours}h</span>
        </div>

        {node.requiredProficiency > 0 && (
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[#5D6268]">Req:</span>
            <span className="text-[#F2F2EE] font-medium">Lvl {node.requiredProficiency}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[#D8FF5A] !border-none"
      />
    </div>
  );
});

SkillNode.displayName = "SkillNode";
