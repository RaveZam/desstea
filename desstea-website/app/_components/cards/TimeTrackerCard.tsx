"use client";

import { useState, useEffect } from "react";

export default function TimeTrackerCard() {
  const [seconds, setSeconds] = useState(8133); // 02:15:33
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="bg-[#6B4F3A] rounded-2xl p-3 text-white relative overflow-hidden flex-shrink-0">
      {/* Background decoration */}
      <div className="absolute -bottom-6 -right-4 w-24 h-24 bg-[#5A3F2E] rounded-full opacity-50" />
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#E8692A] rounded-full opacity-20" />

      <div className="relative z-10">
        <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">
          Time Tracker
        </p>

        <p className="text-3xl font-bold tracking-widest font-mono tabular-nums">
          {h}:{m}:{s}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label={running ? "Pause" : "Resume"}
          >
            {running ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <button
            onClick={() => { setRunning(false); setSeconds(0); }}
            className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Stop"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
