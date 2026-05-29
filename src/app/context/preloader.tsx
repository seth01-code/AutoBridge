"use client";

import { Store } from "lucide-react";
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   AutoBridge Preloader
   Aesthetic: dark navy + orange — industrial precision meets
   African commerce energy. A route-tracker motif: the progress
   bar is styled as a logistics "route" with node pulses, while
   the wordmark assembles itself letter by letter.
───────────────────────────────────────────────────────────── */

const WORDS = ["Commerce.", "Logistics.", "Africa."];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  /* ── progress simulation ── */
  useEffect(() => {
    let current = 0;
    const steps = [
      { target: 30, speed: 18 },
      { target: 65, speed: 25 },
      { target: 88, speed: 40 },
      { target: 100, speed: 15 },
    ];
    let stepIdx = 0;

    const tick = () => {
      if (stepIdx >= steps.length) return;
      const { target, speed } = steps[stepIdx];
      if (current < target) {
        current += 1;
        setProgress(current);
        setTimeout(tick, speed);
      } else {
        stepIdx++;
        setTimeout(tick, 120);
      }
    };
    tick();
  }, []);

  /* ── cycling words ── */
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  /* ── exit when done ── */
  useEffect(() => {
    if (progress < 100) return;
    const t1 = setTimeout(() => setExiting(true), 300);
    const t2 = setTimeout(() => setVisible(false), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#070E1C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateY(-12px)" : "translateY(0)",
        overflow: "hidden",
      }}
    >
      {/* ── background grid ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* ── radial orange glow ── */}
      <div style={{
        position: "absolute",
        top: "40%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── LOGO MARK ── */}
      <div style={{ position: "relative", marginBottom: 40, textAlign: "center" }}>
        {/* hexagonal icon */}
        <div style={{
          width: 72, height: 72,
          margin: "0 auto 20px",
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 72 72" width="72" height="72" fill="none">
            <polygon
              points="36,4 66,20 66,52 36,68 6,52 6,20"
              stroke="rgba(249,115,22,0.4)"
              strokeWidth="1.5"
              fill="rgba(249,115,22,0.06)"
            />
            <polygon
              points="36,14 58,26 58,46 36,58 14,46 14,26"
              stroke="rgba(249,115,22,0.25)"
              strokeWidth="1"
              fill="transparent"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 36 36"
                to="360 36 36"
                dur="8s"
                repeatCount="indefinite"
              />
            </polygon>
            <text
              x="36" y="41"
              textAnchor="middle"
              fill="#F97316"
              fontSize="22"
              fontWeight="700"
              fontFamily="serif"
            ><Store/></text>
          </svg>

          {/* corner spark dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 4, height: 4,
              borderRadius: "50%",
              background: "#F97316",
              top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateY(-38px) translate(-50%,-50%)`,
              opacity: 0.5,
              animation: `abPulse ${1.2 + i * 0.15}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>

        {/* wordmark */}
        <div style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "#FFFFFF",
          textTransform: "uppercase",
          lineHeight: 1,
        }}>
          Auto<span style={{ color: "#F97316" }}>Bridge</span>
        </div>

        {/* cycling sub-word */}
        <div style={{
          marginTop: 10,
          height: 22,
          overflow: "hidden",
          position: "relative",
        }}>
          <div
            key={wordIndex}
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 11,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              fontFamily: "'Georgia', serif",
              animation: "abWordIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            {WORDS[wordIndex]}
          </div>
        </div>
      </div>

      {/* ── ROUTE TRACK ── */}
      <div style={{ width: 280, position: "relative" }}>

        {/* node dots along track */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          top: "50%",
          left: 0, right: 0,
          transform: "translateY(-50%)",
          zIndex: 2,
          pointerEvents: "none",
        }}>
          {[0, 25, 50, 75, 100].map((threshold) => {
            const passed = progress >= threshold;
            return (
              <div key={threshold} style={{
                width: passed ? 8 : 6,
                height: passed ? 8 : 6,
                borderRadius: "50%",
                background: passed ? "#F97316" : "rgba(255,255,255,0.15)",
                border: passed ? "2px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: passed ? "0 0 8px rgba(249,115,22,0.6)" : "none",
                transition: "all 0.3s ease",
                position: "relative",
              }}>
                {passed && progress < threshold + 26 && (
                  <div style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: "1px solid rgba(249,115,22,0.4)",
                    animation: "abRipple 1s ease-out infinite",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* track background */}
        <div style={{
          height: 3,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 99,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* fill */}
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: "linear-gradient(90deg, #EA580C, #F97316, #FB923C)",
            borderRadius: 99,
            transition: "width 0.12s ease",
            boxShadow: "0 0 12px rgba(249,115,22,0.5)",
          }}>
            {/* shimmer */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              animation: "abShimmer 1.4s ease-in-out infinite",
            }} />
          </div>
        </div>

        {/* percent label */}
        <div style={{
          marginTop: 18,
          textAlign: "center",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.3)",
        }}>
          <span style={{ color: "#F97316", fontWeight: 700 }}>
            {String(progress).padStart(3, "0")}
          </span>
          <span style={{ margin: "0 4px" }}>/</span>100
        </div>
      </div>

      {/* ── status line ── */}
      <div style={{
        marginTop: 32,
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
        fontFamily: "'Courier New', monospace",
        animation: "abBlink 1.8s ease-in-out infinite",
      }}>
        {progress < 35 ? "Initialising platform..." :
         progress < 65 ? "Loading catalogue..." :
         progress < 90 ? "Preparing logistics..." :
                         "Ready to ship"}
      </div>

      {/* ── keyframes injected inline ── */}
      <style>{`
        @keyframes abPulse {
          from { opacity: 0.2; transform: rotate(var(--r, 0deg)) translateY(-38px) translate(-50%,-50%) scale(0.8); }
          to   { opacity: 0.8; transform: rotate(var(--r, 0deg)) translateY(-38px) translate(-50%,-50%) scale(1.3); }
        }
        @keyframes abWordIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes abShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes abRipple {
          0%   { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0;   transform: scale(2.4); }
        }
        @keyframes abBlink {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}