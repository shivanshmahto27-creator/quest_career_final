"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar.tsx";
import { LeftProgressionRail } from "../../components/layout/LeftProgressionRail.tsx";
import { RoadmapHeader } from "../../components/roadmap/RoadmapHeader.tsx";
import { NextBestActionCard } from "../../components/roadmap/NextBestActionCard.tsx";
import { NodeDetailPanel } from "../../components/roadmap/NodeDetailPanel.tsx";
import { GraphCanvas } from "../../components/graph/GraphCanvas.tsx";
import { AssistantDrawer } from "../../components/assistant/AssistantDrawer.tsx";
import type { GraphNode, GraphEvaluationResult } from "../../types/graph.ts";

interface RoadmapApiResponse {
  id: string;
  userId: string;
  targetRole: string;
  weeklyHours: number;
  revision: number;
  graphResult: GraphEvaluationResult;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<RoadmapApiResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetRoadmapId = urlParams?.get("roadmapId") || urlParams?.get("id");

      let res = await fetch(targetRoadmapId ? `/api/v1/roadmap/${encodeURIComponent(targetRoadmapId)}` : "/api/v1/roadmap");
      if (!res.ok && targetRoadmapId) {
        res = await fetch("/api/v1/roadmap");
      }

      if (!res.ok && res.status === 404) {
        // Auto-seed demo roadmap if none exists yet
        const genRes = await fetch("/api/v1/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: "Full Stack Developer",
            weeklyHours: 15,
          }),
        });
        if (genRes.ok) {
          const genData = await genRes.json();
          setRoadmap(genData.data);
          setSelectedNode(genData.data.graphResult.graph.nodes[0] || null);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        throw new Error("Failed to load active career roadmap.");
      }

      const json = await res.json();
      setRoadmap(json.data);
      if (json.data?.graphResult?.graph?.nodes?.length > 0) {
        setSelectedNode(json.data.graphResult.graph.nodes[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load roadmap.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  // Handle "I Already Know This" event
  const handleMarkKnown = async (nodeId: string, skillId?: string) => {
    if (!roadmap) return;
    setUpdating(true);

    try {
      const targetSkillId = skillId || nodeId;
      const res = await fetch(`/api/v1/me/skills/${targetSkillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proficiency: 3, // Proficient -> triggers ALREADY_KNOWN
          status: "ALREADY_KNOWN",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to update skill state.");
      }

      const json = await res.json();
      if (json.data?.roadmap) {
        setRoadmap(json.data.roadmap);
        // Refresh selected node from updated roadmap
        const updated = json.data.roadmap.graphResult.graph.nodes.find(
          (n: GraphNode) => n.id === nodeId
        );
        if (updated) setSelectedNode(updated);

        const unlockedCount = json.data.roadmapImpact?.nodesUnlocked || 0;
        showToast(
          unlockedCount > 0
            ? `Skill marked as known! ${unlockedCount} downstream milestone${unlockedCount > 1 ? "s" : ""} unlocked.`
            : "Skill marked as known! Timeline recomputed."
        );
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Skill update failed.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle "Start Practice Quest" event
  const handleStartQuest = async (nodeId: string) => {
    if (!roadmap) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/v1/roadmap/${roadmap.id}/nodes/${nodeId}/quest`, {
        method: "POST",
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to start quest.");
      }

      const json = await res.json();
      showToast(`Quest started: "${json.data.title}". Launching mission workspace...`);

      // Refresh roadmap to reflect IN_PROGRESS status
      await fetchRoadmap();

      // Navigate to dedicated mission workspace
      if (json.data?.id) {
        router.push(`/quest/${json.data.id}`);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Quest start failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFocusNextBestAction = (nodeId: string) => {
    if (!roadmap) return;
    const node = roadmap.graphResult.graph.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      showToast(`Focused on Next Best Action: ${node.title}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050607] text-[#F2F2EE] overflow-hidden">
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftProgressionRail activeStep={4} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-xs font-mono text-[#85898F]">
              <span className="w-8 h-8 border-2 border-[#D8FF5A] border-t-transparent rounded-full animate-spin" />
              <span>Loading career graph & evaluating live state...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-8 h-8 text-[#FF7C7C] mb-3" />
              <h2 className="text-base font-bold text-[#F2F2EE] mb-1">Unable to Load Roadmap</h2>
              <p className="text-xs text-[#85898F] max-w-md mb-6">{error}</p>
              <button
                onClick={fetchRoadmap}
                className="px-4 py-2 rounded-lg bg-[#101316] border border-[#2A2F33] text-xs font-mono text-[#F2F2EE] flex items-center gap-2 hover:bg-[#1B1E21]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : !roadmap ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-10 h-10 text-[#D8FF5A] mb-3 stroke-[1.5]" />
              <h2 className="text-xl font-bold text-[#F2F2EE] mb-1">Your Career Quest Hasn&apos;t Started</h2>
              <p className="text-xs text-[#85898F] max-w-md mb-6">
                Choose your dream role and reverse-engineer your learning graph.
              </p>
              <Link
                href="/onboarding"
                className="px-5 py-2.5 rounded-lg bg-[#D8FF5A] text-black font-mono font-bold text-xs uppercase tracking-wider"
              >
                Create My Roadmap
              </Link>
            </div>
          ) : (
            <>
              {/* Header with target role and progress */}
              <RoadmapHeader
                targetRole={roadmap.targetRole}
                timeline={roadmap.graphResult.timeline}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />

              {/* Next Best Action Banner Bar */}
              <div className="px-6 py-3 bg-[#050607] border-b border-[#1B1E21] shrink-0">
                <NextBestActionCard
                  action={roadmap.graphResult.nextBestAction}
                  onFocusNode={handleFocusNextBestAction}
                  onStartQuest={handleStartQuest}
                  isUpdating={updating}
                />
              </div>

              {/* Graph Area + Selected Node Panel */}
              <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 h-full min-w-0 relative">
                  <GraphCanvas
                    graph={roadmap.graphResult.graph}
                    nextBestActionNodeId={roadmap.graphResult.nextBestAction?.nodeId}
                    selectedNodeId={selectedNode?.id}
                    onSelectNode={(node) => setSelectedNode(node)}
                    statusFilter={statusFilter}
                  />
                </div>

                {selectedNode && (
                  <NodeDetailPanel
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onMarkKnown={handleMarkKnown}
                    onStartQuest={handleStartQuest}
                    isUpdating={updating}
                  />
                )}
              </div>

              {/* Contextual AI Assistant Drawer */}
              <AssistantDrawer
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                roadmapId={roadmap.id}
                onRoadmapUpdated={fetchRoadmap}
              />
            </>
          )}
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#101316] border border-[#D8FF5A] text-[#F2F2EE] px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono flex items-center gap-2 animate-bounce"
        >
          <Sparkles className="w-4 h-4 text-[#D8FF5A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
