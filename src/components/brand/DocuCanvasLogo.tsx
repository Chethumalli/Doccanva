"use client";

import React from "react";
import Link from "next/link";

interface DocuCanvasLogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  href?: string;
  className?: string;
}

export function DocuCanvasLogo({
  size = "md",
  withText = true,
  href,
  className = "",
}: DocuCanvasLogoProps) {
  const iconSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }[size];

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Brand Icon with Glow & Border */}
      <div
        className={`relative ${iconSizeClasses} shrink-0 rounded-2xl overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 shadow-md shadow-cyan-500/20 transition-all duration-300 group-hover:shadow-cyan-400/40 group-hover:scale-105 group-hover:border-cyan-300`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.jpg"
          alt="DocuCanvas Logo"
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            // Fallback to SVG if image file fails
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        {/* SVG Fallback embedded inside */}
        <div className="absolute inset-0 flex items-center justify-center p-1.5 pointer-events-none">
          <svg viewBox="0 0 40 40" className="h-full w-full drop-shadow">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M10 6 A4 4 0 0 1 14 2 L26 2 L34 10 L34 34 A4 4 0 0 1 30 38 L10 38 A4 4 0 0 1 6 34 L6 10 A4 4 0 0 1 10 6 Z"
              fill="none"
              stroke="url(#logoGrad)"
              strokeWidth="2.5"
            />
            <path d="M26 2 L26 10 L34 10" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <path
              d="M12 28 Q 20 16, 28 22"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white ${textSizeClasses}`}
            >
              Docu
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Canvas
              </span>
            </span>
            <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cyan-300 border border-cyan-500/30 uppercase">
              DOCX AI
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wide text-slate-400 -mt-0.5">
            Canva for Word Documents
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
