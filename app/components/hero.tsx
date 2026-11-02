"use client";
import { useEffect, useRef } from "react";
import anime from "animejs";
import { ArrowRight, Check, Copy } from "lucide-react";
import { LinkButton } from "./button";
import CopyEmail from "./copyemail";
import { profile } from "../../lib/data";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: heroRef.current?.children || [],
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(150),
      duration: 800,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <section id="top" className="mx-auto max-w-6xl px-6 pb-24 pt-40 md:pt-52">
      <div ref={heroRef} className="max-w-3xl">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-ink">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {profile.status}
        </p>

        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          {profile.headline}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
          {profile.tagline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <LinkButton href="#projects">
            View My Work
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </LinkButton>
          <CopyEmail
            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-base font-medium hover:border-accent/60 hover:bg-white/5"
            renderAction={(copied: boolean) => (
              <>
                {copied ? (
                  <Check size={18} className="text-success" />
                ) : (
                  <Copy size={18} className="text-muted" />
                )}
                Copy Email
              </>
            )}
          />
        </div>
      </div>
    </section>
  );
}
