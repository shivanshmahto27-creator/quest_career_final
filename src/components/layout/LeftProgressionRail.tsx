"use client";

import React from "react";

interface LeftProgressionRailProps {
  activeStep?: number;
}

export function LeftProgressionRail({ activeStep = 4 }: LeftProgressionRailProps) {
  const steps = [
    { num: "01", label: "TARGET" },
    { num: "02", label: "CURRENT" },
    { num: "03", label: "GAP" },
    { num: "04", label: "ROADMAP" },
    { num: "05", label: "QUEST" },
    { num: "06", label: "PROGRESS" },
  ];

  return (
    <aside
      className="hidden lg:flex w-28 border-r border-[#1B1E21] bg-[#050607] flex-col py-6 select-none shrink-0"
      aria-label="Career Journey Progression Rail"
    >
      <div className="px-4 mb-6">
        <span className="text-[10px] font-mono text-[#5D6268] uppercase tracking-widest">Journey</span>
      </div>

      <div className="flex flex-col gap-5 px-3">
        {steps.map((s, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = stepNumber === activeStep;
          const isPast = stepNumber < activeStep;

          return (
            <div
              key={s.num}
              className={`flex flex-col gap-1 px-2 py-1.5 rounded transition-all ${
                isCurrent
                  ? "border-l-2 border-[#D8FF5A] bg-[#0B0D0F] pl-2.5"
                  : isPast
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              <span
                className={`text-[10px] font-mono leading-none ${
                  isCurrent ? "text-[#D8FF5A]" : "text-[#85898F]"
                }`}
              >
                {s.num}
              </span>
              <span
                className={`text-[11px] font-mono font-medium tracking-wider leading-none ${
                  isCurrent ? "text-[#F2F2EE]" : "text-[#5D6268]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
