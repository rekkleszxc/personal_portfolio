"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { profile, skills, type Level } from "../../lib/data";

const labels: Record<Level, string> = {
  1: "Familiar",
  2: "Proficient",
  3: "Expert",
};

function Dots({ level }: { level: Level }) {
  return (
    <span className="flex gap-1" role="img" aria-label={labels[level]}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${n <= level ? "bg-accent" : "bg-white/15"}`}
        />
      ))}
    </span>
  );
}

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animate(aboutRef.current?.children || [], {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(200),
      duration: 800,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <section id="about" className="border-t border-white/10 py-24">
      <div
        ref={aboutRef}
        className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.2fr]"
      >
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            About me
          </h2>
          <div className="mt-6 max-w-[60ch] space-y-4 text-lg leading-relaxed text-muted">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((group) => (
            <div
              key={group.domain}
              className="rounded-2xl border border-white/10 bg-surface p-5 hover:border-accent/40 transition-colors"
            >
              <h3 className="font-display text-lg font-semibold">
                {group.domain}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.items.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3 text-[15px]"
                  >
                    <span>{s.name}</span>
                    <Dots level={s.level} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
