"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full bg-transparent overflow-hidden pointer-events-none z-0",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-transparent [mask-image:radial-gradient(transparent,white)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-purple-500/20 rounded-full blur-[10rem] animate-pulse"></div>
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[8rem] animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[8rem] animate-blob animation-delay-2000"></div>
    </div>
  );
};
