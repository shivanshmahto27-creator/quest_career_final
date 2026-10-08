"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  Github,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { questApi } from "../../../lib/api/client.ts";
import type { StoredQuest } from "../../../modules/quest/service.ts";

interface PageProps {
  params: Promise<{ questId: string }>;
}

export default function QuestWorkspacePage({ params }: PageProps) {
  const router = useRouter();
  const { questId } = use(params);

  const [quest, setQuest] = useState<StoredQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local interactive tasks state
  const [tasks, setTasks] = useState<Array<{ title: string; completed: boolean; estimatedMinutes?: number }>>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    nodesUnlocked: string[];
  } | null>(null);

  useEffect(() => {
    async function loadQuest() {
      try {
        setLoading(true);
        setError(null);
        const data = await questApi.get(questId);
        setQuest(data);
        setTasks(data.tasks || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load quest details.");
      } finally {
        setLoading(false);
      }
    }

    loadQuest();
  }, [questId]);

  const toggleTask = (index: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCompleteQuest = async () => {
    if (!quest) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await questApi.complete(quest.id, {
        evidenceType: "GITHUB_REPO",
        evidenceUrl: repoUrl.trim() || "https://github.com/demo/career-quest-submission",
      });

      setQuest(res.quest);
      setTasks(res.quest.tasks);
      setCompletionResult({
        nodesUnlocked: res.nodesUnlocked || [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete quest.");
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isCompleted = quest?.status === "COMPLETED";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050607] text-[#F2F2EE] flex flex-col items-center justify-center p-6" id="quest-loading">
        <Loader2 className="w-8 h-8 text-[#D8FF5A] animate-spin mb-4" />
        <h2 className="text-sm font-mono text-[#85898F] tracking-widest uppercase">
          Initializing Mission Workspace...
        </h2>
      </main>
    );
  }

  if (error && !quest) {
    return (
      <main className="min-h-screen bg-[#050607] text-[#F2F2EE] flex flex-col items-center justify-center p-6" id="quest-error">
        <div className="max-w-md w-full bg-[#101316] border border-[#FF7C7C]/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-[#FF7C7C] mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Quest Not Found</h2>
          <p className="text-sm text-[#85898F] mb-6">{error}</p>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B1E21] hover:bg-[#2A2F33] text-xs font-mono text-[#F2F2EE] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Roadmap</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050607] text-[#F2F2EE] pb-24" id="quest-workspace">
      {/* Top Banner Navigation */}
      <nav className="border-b border-[#1B1E21] bg-[#0B0D0F]/80 backdrop-blur-md px-6 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/roadmap"
            className="flex items-center gap-2 text-xs font-mono text-[#85898F] hover:text-[#F2F2EE] transition-colors px-2 py-1 rounded hover:bg-[#101316]"
            id="quest-back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Career Graph</span>
          </Link>
          <span className="text-[#2A2F33] hidden sm:inline">|</span>
          <span className="text-[11px] font-mono text-[#5D6268] tracking-widest uppercase hidden sm:inline">
            Mission Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
              isCompleted
                ? "bg-[#8DDC9A]/10 border-[#8DDC9A]/30 text-[#8DDC9A]"
                : "bg-[#D8FF5A]/10 border-[#D8FF5A]/30 text-[#D8FF5A]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCompleted ? "bg-[#8DDC9A]" : "bg-[#D8FF5A] animate-pulse"
              }`}
            />
            {quest?.status}
          </span>
        </div>
      </nav>

      {/* Main Workspace Grid */}
      <div className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Mission Details & Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Completion Celebration Banner */}
          {completionResult && (
            <div className="p-5 rounded-2xl bg-[#8DDC9A]/10 border border-[#8DDC9A]/40 text-[#F2F2EE] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8DDC9A]/20 flex items-center justify-center shrink-0 text-[#8DDC9A]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#8DDC9A] mb-1">
                  Quest Completed & Evidence Verified!
                </h3>
                <p className="text-xs text-[#85898F] leading-relaxed mb-3">
                  Your skill proficiency has advanced. The Graph Engine has evaluated your career
                  graph and unlocked dependent milestones.
                </p>
                {completionResult.nodesUnlocked.length > 0 && (
                  <div className="text-xs font-mono text-[#D8FF5A] mb-3">
                    Downstream nodes unlocked:{" "}
                    <span className="font-bold underline">
                      {completionResult.nodesUnlocked.join(", ")}
                    </span>
                  </div>
                )}
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8DDC9A] hover:bg-[#8DDC9A]/90 text-black text-xs font-mono font-bold transition-transform active:scale-95"
                >
                  <span>View Updated Roadmap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Header Card */}
          <section className="bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6 sm:p-8" aria-label="Quest Header">
            <div className="flex items-center gap-2 text-xs font-mono text-[#85898F] mb-2">
              <span className="text-[#D8FF5A] font-bold">QUEST</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#5D6268]" />
                {quest?.estimatedHours}h Estimated Effort
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F2EE] tracking-tight mb-4">
              {quest?.title}
            </h1>

            <p className="text-sm text-[#85898F] leading-relaxed mb-6">
              {quest?.objective}
            </p>

            {/* Progress Bar */}
            <div className="bg-[#101316] border border-[#1B1E21] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#85898F]">Execution Progress</span>
                <span className="text-[#D8FF5A] font-bold">
                  {completedCount} / {tasks.length} Tasks ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#1B1E21] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D8FF5A] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

          {/* Tasks & Milestones Section */}
          <section className="bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6 sm:p-8" aria-label="Quest Tasks">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#F2F2EE] flex items-center gap-2 font-mono uppercase tracking-wider text-xs">
                <span>Task Execution Checklist</span>
              </h2>
              <span className="text-[11px] font-mono text-[#5D6268]">
                Interactive Verification
              </span>
            </div>

            <div className="flex flex-col gap-3" id="quest-tasks-list">
              {tasks.map((task, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    task.completed
                      ? "bg-[#101316]/50 border-[#8DDC9A]/30 text-[#85898F]"
                      : "bg-[#101316] border-[#1B1E21] hover:border-[#2A2F33] text-[#F2F2EE]"
                  }`}
                  aria-label={`Toggle task: ${task.title}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#8DDC9A]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#5D6268]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          task.completed ? "line-through text-[#5D6268]" : "text-[#F2F2EE]"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.estimatedMinutes && (
                        <span className="text-[11px] font-mono text-[#5D6268] shrink-0">
                          {task.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Technical Interview Readiness Questions */}
          {quest?.interviewQuestions && quest.interviewQuestions.length > 0 && (
            <section className="bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6 sm:p-8" aria-label="Interview Practice">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-[#8EA7FF]" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-[#8EA7FF] font-bold">
                  Interview Readiness Check
                </h2>
              </div>
              <p className="text-xs text-[#85898F] mb-4">
                Prepare for technical screens by ensuring you can confidently answer these questions:
              </p>
              <div className="flex flex-col gap-2.5">
                {quest.interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#101316] border border-[#1B1E21] text-xs text-[#F2F2EE] font-mono flex items-start gap-2.5"
                  >
                    <span className="text-[#8EA7FF] font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Deliverable & Evidence Submission */}
        <aside className="flex flex-col gap-6" aria-label="Deliverable and Submission">
          {/* GitHub Idea Card */}
          {quest?.githubIdea && (
            <div className="bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D8FF5A] font-bold uppercase tracking-wider mb-3">
                <Github className="w-4 h-4" />
                <span>Deliverable Specification</span>
              </div>
              <h3 className="text-sm font-bold text-[#F2F2EE] mb-2">Portfolio Project Concept</h3>
              <p className="text-xs text-[#85898F] leading-relaxed mb-4">
                {quest.githubIdea}
              </p>
              <div className="p-3 rounded-lg bg-[#101316] border border-[#1B1E21] text-[11px] font-mono text-[#5D6268]">
                Requirement: Clean commits, structured README, and executable instructions.
              </div>
            </div>
          )}

          {/* Submission Card */}
          <div className="bg-[#0B0D0F] border border-[#1B1E21] rounded-2xl p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#5D6268] font-bold mb-4">
              Evidence & Verification
            </h3>

            <div className="mb-4">
              <label htmlFor="repo-url" className="block text-xs font-mono text-[#85898F] mb-1.5">
                Repository / Project URL
              </label>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/alex/my-project"
                disabled={isCompleted || submitting}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#101316] border border-[#2A2F33] text-xs font-mono text-[#F2F2EE] placeholder-[#5D6268] focus:border-[#D8FF5A] focus:outline-none disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#FF7C7C]/10 border border-[#FF7C7C]/30 text-xs text-[#FF7C7C] mb-4">
                {error}
              </div>
            )}

            {!isCompleted ? (
              <button
                id="complete-quest-btn"
                type="button"
                disabled={submitting}
                onClick={handleCompleteQuest}
                className="w-full py-3 rounded-xl bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_2px_16px_rgba(216,255,90,0.2)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Completion...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Mark Quest Complete</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center py-3 bg-[#101316] rounded-xl border border-[#8DDC9A]/30 text-xs font-mono text-[#8DDC9A] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mission Completed & Stored</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
