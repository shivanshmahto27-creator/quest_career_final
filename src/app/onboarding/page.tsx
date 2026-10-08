"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, Check, Clock, Briefcase } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar.tsx";

const SUGGESTED_ROLES = [
  "Full Stack Developer",
  "Frontend Engineer (React/Next.js)",
  "Backend Systems Engineer",
  "Cloud Solutions Architect",
];

const CATALOG_SKILLS = [
  { id: "javascript", name: "JavaScript", slug: "javascript" },
  { id: "typescript", name: "TypeScript", slug: "typescript" },
  { id: "react", name: "React", slug: "react" },
  { id: "nodejs", name: "Node.js", slug: "nodejs" },
  { id: "sql", name: "SQL & Relational DBs", slug: "sql" },
  { id: "git", name: "Git & Version Control", slug: "git" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) => {
      const copy = { ...prev };
      if (copy[slug]) {
        delete copy[slug];
      } else {
        copy[slug] = 3; // Default proficient level
      }
      return copy;
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      setLoadingStage("Reverse-engineering target role requirements...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStage("Synthesizing skill phases and dependencies...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStage("Validating DAG acyclicity with Graph Engine...");

      const currentSkillsPayload = Object.entries(selectedSkills).map(([skillId, proficiency]) => ({
        skillId,
        proficiency,
      }));

      const res = await fetch("/api/v1/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          weeklyHours,
          currentSkills: currentSkillsPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to generate roadmap.");
      }

      const json = await res.json();
      const canonicalRoadmapId = json.data?.id;

      setLoadingStage("Materializing interactive career graph...");
      await new Promise((r) => setTimeout(r, 400));

      router.push(canonicalRoadmapId ? `/roadmap?roadmapId=${encodeURIComponent(canonicalRoadmapId)}` : "/roadmap");
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Roadmap generation failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050607] text-[#F2F2EE]">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-xl mx-auto w-full">
        {/* Progress Dots */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-[#D8FF5A]"
                  : s < step
                  ? "w-4 bg-[#8DDC9A]"
                  : "w-4 bg-[#1B1E21]"
              }`}
            />
          ))}
          <span className="text-[11px] font-mono text-[#85898F] ml-2">Step {step} of 3</span>
        </div>

        {error && (
          <div className="w-full p-4 mb-6 rounded-lg bg-[#FF7C7C]/15 border border-[#FF7C7C]/30 text-xs text-[#FF7C7C] font-mono">
            {error}
          </div>
        )}

        {/* Step 1: Target Role */}
        {step === 1 && (
          <div className="w-full flex flex-col gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#D8FF5A]">
                01 Target Destination
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2EE] mt-1">
                What is your dream technical role?
              </h2>
              <p className="text-xs text-[#85898F] mt-1.5">
                We will reverse-engineer exact industry skill expectations into an actionable graph.
              </p>
            </div>

            <div>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Machine Learning Engineer..."
                className="w-full px-4 py-3.5 rounded-lg bg-[#0B0D0F] border border-[#2A2F33] focus:border-[#D8FF5A] focus:outline-none text-sm text-[#F2F2EE] font-medium"
              />

              <div className="flex flex-wrap gap-2 mt-3">
                {SUGGESTED_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className="px-2.5 py-1.5 rounded-md bg-[#101316] hover:bg-[#1B1E21] border border-[#1B1E21] text-[11px] font-mono text-[#85898F] hover:text-[#F2F2EE] transition-colors"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!targetRole.trim()}
              className="mt-4 w-full py-3 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Known Skills */}
        {step === 2 && (
          <div className="w-full flex flex-col gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#D8FF5A]">
                02 Baseline Skills
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2EE] mt-1">
                Which skills do you already know?
              </h2>
              <p className="text-xs text-[#85898F] mt-1.5">
                Selecting known skills removes unnecessary learning effort and unlocks advanced paths.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CATALOG_SKILLS.map((skill) => {
                const isSelected = !!selectedSkills[skill.slug];
                return (
                  <button
                    key={skill.slug}
                    type="button"
                    onClick={() => toggleSkill(skill.slug)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#D8FF5A]/15 border-[#D8FF5A] text-[#D8FF5A]"
                        : "bg-[#0B0D0F] border-[#1B1E21] text-[#85898F] hover:border-[#2A2F33] hover:text-[#F2F2EE]"
                    }`}
                  >
                    <span className="text-xs font-mono font-medium">{skill.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#D8FF5A]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-lg border border-[#2A2F33] bg-[#0B0D0F] text-xs font-mono text-[#85898F] hover:text-[#F2F2EE]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Weekly Hours & Generate */}
        {step === 3 && (
          <div className="w-full flex flex-col gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#D8FF5A]">
                03 Learning Pace
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2EE] mt-1">
                How many hours can you dedicate weekly?
              </h2>
              <p className="text-xs text-[#85898F] mt-1.5">
                Our timeline engine dynamically computes your projected milestone dates based on this pace.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B0D0F] border border-[#1B1E21]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#85898F] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D8FF5A]" />
                  Weekly Commitment
                </span>
                <span className="text-2xl font-bold text-[#D8FF5A] font-mono">
                  {weeklyHours} hrs / week
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[#D8FF5A] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#5D6268] mt-2">
                <span>5h (Part-time)</span>
                <span>20h (Focused)</span>
                <span>40h (Full-time)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                disabled={loading}
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-lg border border-[#2A2F33] bg-[#0B0D0F] text-xs font-mono text-[#85898F] hover:text-[#F2F2EE] disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                disabled={loading}
                onClick={handleGenerate}
                className="flex-1 py-3.5 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-[#D8FF5A]/10"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Generate Career Roadmap</span>
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="p-4 rounded-lg bg-[#101316] border border-[#2A2F33] flex items-center gap-3 text-xs font-mono text-[#D8FF5A]">
                <span className="w-2 h-2 rounded-full bg-[#D8FF5A] animate-ping" />
                <span>{loadingStage}</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
