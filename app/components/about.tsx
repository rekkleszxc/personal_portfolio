"use client";

import { motion } from "framer-motion";
import { rise, stagger, spring, viewport } from "../../lib/motion";
import { profile, skills, type Level } from "../../lib/data";;

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
  return (
    <section id="about" className="border-t border-white/10 py-24">
      <motion.div
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.2fr]"
      >
        <motion.div variants={rise}>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            About me
          </h2>
          <div className="mt-6 max-w-[60ch] space-y-4 text-lg leading-relaxed text-muted">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          className="grid gap-4 sm:grid-cols-2"
        >
          {skills.map((group) => (
            <motion.div
              key={group.domain}
              variants={rise}
              whileHover={{ y: -4 }}
              transition={spring}
              className="rounded-2xl border border-white/10 bg-surface p-5 hover:border-accent/40"
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
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
