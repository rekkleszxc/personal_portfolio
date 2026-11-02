"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { categories, projects, type Project } from "../../lib/data";
import { rise, spring, viewport } from "../../lib/motion";

type Filter = (typeof categories)[number];

/* Outer card radius 24px with 12px inset gives the preview a 12px radius, so the corners stay concentric. */
function Preview({ p }: { p: Project }) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-[12px]"
      style={{ backgroundColor: p.tone }}
    >
      {p.image ? (
        <Image
          src={p.image}
          alt={`Preview of ${p.title}`}
          fill
          sizes="(min-width:1024px) 360px, 100vw"
          className="object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 320 200"
          className="h-full w-full"
          role="img"
          aria-label={`Preview of ${p.title}`}
        >
          <rect
            x="28"
            y="28"
            width="264"
            height="144"
            rx="8"
            fill="#0b1220"
            fillOpacity=".92"
          />
          <rect x="44" y="44" width="90" height="10" rx="5" fill={p.tone} />
          <rect x="44" y="68" width="232" height="8" rx="4" fill="#26324a" />
          <rect x="44" y="84" width="180" height="8" rx="4" fill="#26324a" />
          <rect
            x="44"
            y="112"
            width="104"
            height="44"
            rx="6"
            fill={p.tone}
            fillOpacity=".35"
          />
          <rect x="160" y="112" width="116" height="44" rx="6" fill="#1a2438" />
        </svg>
      )}
    </div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const list =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Selected projects
            </h2>
            <p className="mt-3 max-w-lg text-base text-muted">
              Production work and side projects, with the numbers I could
              measure.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-surface p-1"
            role="group"
            aria-label="Filter projects"
          >
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={`relative rounded-xl px-4 py-2 text-[15px] font-medium transition-colors ${filter === c ? "text-accent-ink" : "text-muted hover:text-ink"}`}
              >
                {filter === c && (
                  <motion.span
                    layoutId="tab-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-xl bg-accent"
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.ul
          layout
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.title}
                layout
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  layout: spring,
                  duration: 0.5,
                  delay: (i % 3) * 0.08,
                  ease: "easeOut",
                }}
                className="flex"
              >
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={spring}
                  className="group relative flex w-full flex-col rounded-[24px] border border-white/10 bg-surface p-3 hover:border-accent/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: "0 0 40px -12px rgba(34,211,238,.45)" }}
                  />
                  <Preview p={p} />
                  <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                    <h3 className="font-display text-xl font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted">
                      {p.description}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-3">
                      {p.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-white/10 bg-canvas/60 px-3 py-2"
                        >
                          <dd className="font-display text-lg font-semibold text-accent">
                            {m.value}
                          </dd>
                          <dt className="text-sm text-muted">{m.label}</dt>
                        </div>
                      ))}
                    </dl>
                    <ul
                      className="mt-5 flex flex-wrap gap-2"
                      aria-label="Tech stack"
                    >
                      {p.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-white/10 px-3 py-1 text-sm text-muted"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center gap-5 pt-6">
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-base font-semibold text-accent hover:underline underline-offset-4"
                      >
                        Live demo <ArrowUpRight size={16} />
                      </a>
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-base font-medium text-muted hover:text-ink"
                      >
                        <Github size={16} /> Code
                      </a>
                    </div>
                  </div>
                </motion.article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
