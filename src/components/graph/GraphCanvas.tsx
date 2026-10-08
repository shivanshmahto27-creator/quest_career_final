"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SkillNode } from "./SkillNode.tsx";
import type { CareerGraph, GraphNode } from "../../types/graph.ts";

const nodeTypes = {
  skillNode: SkillNode,
};

interface GraphCanvasProps {
  graph: CareerGraph;
  nextBestActionNodeId?: string;
  selectedNodeId?: string;
  onSelectNode: (node: GraphNode) => void;
  statusFilter?: string;
}

export function GraphCanvas({
  graph,
  nextBestActionNodeId,
  selectedNodeId,
  onSelectNode,
  statusFilter = "ALL",
}: GraphCanvasProps) {
  // Deterministic automatic layered layout
  const { nodes, edges } = useMemo(() => {
    // Filter nodes if filter active
    const filteredNodes =
      statusFilter === "ALL"
        ? graph.nodes
        : graph.nodes.filter((n) => n.status === statusFilter);

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // Group nodes by phaseId for layered horizontal layout
    const phaseGroups = new Map<string, GraphNode[]>();
    for (const node of filteredNodes) {
      const pid = node.phaseId || "default";
      if (!phaseGroups.has(pid)) {
        phaseGroups.set(pid, []);
      }
      phaseGroups.get(pid)!.push(node);
    }

    const flowNodes: Node[] = [];
    const layerSpacingY = 180;
    const nodeSpacingX = 300;

    let layerIndex = 0;
    for (const [, phaseNodes] of phaseGroups.entries()) {
      const startX = Math.max(50, 600 - (phaseNodes.length * nodeSpacingX) / 2);

      phaseNodes.forEach((node, nodeIdx) => {
        flowNodes.push({
          id: node.id,
          type: "skillNode",
          position: {
            x: startX + nodeIdx * nodeSpacingX,
            y: 50 + layerIndex * layerSpacingY,
          },
          data: {
            ...node,
            isNextBestAction: node.id === nextBestActionNodeId,
            isSelected: node.id === selectedNodeId,
          },
          selected: node.id === selectedNodeId,
        });
      });
      layerIndex++;
    }

    // Convert edges
    const flowEdges: Edge[] = graph.edges
      .filter((e) => filteredNodeIds.has(e.sourceNodeId) && filteredNodeIds.has(e.targetNodeId))
      .map((edge) => {
        const isSatisfied = edge.required;
        return {
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          animated: edge.required,
          style: {
            stroke: isSatisfied ? "#2A2F33" : "#5D6268",
            strokeWidth: edge.required ? 2 : 1.5,
            strokeDasharray: edge.required ? undefined : "5 5",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isSatisfied ? "#85898F" : "#5D6268",
            width: 16,
            height: 16,
          },
        };
      });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graph, nextBestActionNodeId, selectedNodeId, statusFilter]);

  return (
    <div className="w-full h-full relative bg-[#050607]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => {
          const original = graph.nodes.find((n) => n.id === node.id);
          if (original) onSelectNode(original);
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1B1E21" gap={24} size={1} />
        <Controls
          className="!bg-[#0B0D0F] !border !border-[#1B1E21] !rounded-lg !overflow-hidden [&>button]:!bg-[#0B0D0F] [&>button]:!border-b [&>button]:!border-[#1B1E21] [&>button]:!text-[#F2F2EE] [&>button:hover]:!bg-[#101316]"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as unknown as GraphNode;
            if (data?.status === "COMPLETED" || data?.status === "ALREADY_KNOWN") return "#8DDC9A";
            if (data?.status === "AVAILABLE") return "#D8FF5A";
            if (data?.status === "IN_PROGRESS") return "#8EA7FF";
            return "#1B1E21";
          }}
          maskColor="rgba(5, 6, 7, 0.75)"
          className="!bg-[#0B0D0F] !border !border-[#1B1E21] !rounded-lg hidden md:block"
        />
      </ReactFlow>
    </div>
  );
}
