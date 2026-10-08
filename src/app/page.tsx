import Link from "next/link";
import { Compass, ArrowRight, GitBranch, Zap, Target, Layers } from "lucide-react";
import { Navbar } from "../components/layout/Navbar.tsx";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050607] text-[#F2F2EE]">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 py-20 w-full">
        {/* Technical Label */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#D8FF5A] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-[#85898F] uppercase">
            Career Intelligence System v1.1
          </span>
        </div>

        {/* Hero Editorial Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl text-[#F2F2EE] mb-8">
          BUILD THE SHORTEST PATH TO YOUR DREAM ROLE.
        </h1>

        <p className="text-base sm:text-lg text-[#85898F] max-w-2xl leading-relaxed mb-10">
          Career Quest reverse-engineers technical role requirements into a deterministic
          dependency graph. Unblock what matters, skip what you already know, and execute
          one clear Next Best Action at a time.
        </p>

        {/* CTA Strip */}
        <div className="flex flex-wrap items-center gap-4 mb-20">
          <Link
            href="/onboarding"
            className="px-6 py-3.5 rounded-lg bg-[#D8FF5A] hover:bg-[#D8FF5A]/90 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-transform active:scale-95 shadow-lg"
          >
            <span>Start Your Quest</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <Link
            href="/roadmap"
            className="px-6 py-3.5 rounded-lg bg-[#0B0D0F] hover:bg-[#101316] border border-[#2A2F33] text-[#F2F2EE] font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <span>Inspect Live Demo Roadmap</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#1B1E21] pt-12">
          <div className="p-6 rounded-xl bg-[#0B0D0F] border border-[#1B1E21]">
            <div className="w-8 h-8 rounded bg-[#101316] border border-[#2A2F33] flex items-center justify-center text-[#D8FF5A] mb-4">
              <GitBranch className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-mono font-bold text-[#F2F2EE] uppercase tracking-wider mb-2">
              Deterministic DAG Brain
            </h2>
            <p className="text-xs text-[#85898F] leading-relaxed">
              No hallucinated checklists. Prerequisites, lock states, and cycle prevention
              are evaluated mathematically by an authoritative graph engine.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0D0F] border border-[#1B1E21]">
            <div className="w-8 h-8 rounded bg-[#101316] border border-[#2A2F33] flex items-center justify-center text-[#8EA7FF] mb-4">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-mono font-bold text-[#F2F2EE] uppercase tracking-wider mb-2">
              Dynamic Skill Rerouting
            </h2>
            <p className="text-xs text-[#85898F] leading-relaxed">
              Tell the system what you already know. The graph immediately prunes effort,
              unlocks downstream milestones, and shortens your timeline.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0D0F] border border-[#1B1E21]">
            <div className="w-8 h-8 rounded bg-[#101316] border border-[#2A2F33] flex items-center justify-center text-[#8DDC9A] mb-4">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-mono font-bold text-[#F2F2EE] uppercase tracking-wider mb-2">
              Single Next Best Action
            </h2>
            <p className="text-xs text-[#85898F] leading-relaxed">
              Stop wondering what to study today. Get one ranked, high-leverage mission
              with clear reasoning, effort estimation, and practice tasks.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1B1E21] py-6 px-6 text-center text-xs font-mono text-[#5D6268]">
        Career Quest • Reverse-Engineered Career Roadmapper • Modular Monolith Architecture
      </footer>
    </div>
  );
}
