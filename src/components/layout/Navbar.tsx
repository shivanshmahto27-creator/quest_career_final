"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Sparkles, Map, BookOpen, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "ROADMAP", href: "/roadmap", icon: Map },
    { label: "ASSISTANT", href: "/assistant", icon: Sparkles },
    { label: "ONBOARDING", href: "/onboarding", icon: Layers },
  ];

  return (
    <header className="h-14 border-b border-[#1B1E21] bg-[#050607]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-wider text-sm text-[#F2F2EE] hover:opacity-90">
          <div className="w-7 h-7 rounded bg-[#D8FF5A] flex items-center justify-center text-black shadow-sm">
            <Compass className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="tracking-widest uppercase font-mono text-xs">Career Quest</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 border-l border-[#1B1E21] pl-6" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#101316] text-[#D8FF5A] border border-[#2A2F33]"
                    : "text-[#85898F] hover:text-[#F2F2EE] hover:bg-[#0B0D0F]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B0D0F] border border-[#1B1E21] text-[11px] font-mono text-[#85898F]">
          <span className="w-2 h-2 rounded-full bg-[#8DDC9A]" />
          <span>Alex Mercer (Demo)</span>
        </div>
      </div>
    </header>
  );
}
