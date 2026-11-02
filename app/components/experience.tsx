"use client";
import { motion } from "framer-motion";
import { experience } from "../../lib/data";
import { rise, spring, stagger, viewport } from "../../lib/motion";

export default function Experience() {
  return (
    <section id="experience" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="font-display text-3xl font-bold tracking-tight md:text-4xl"
        >
          Experience
        </motion.h2>

        <motion.ol
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="relative ml-2 mt-12 space-y-8 border-l border-white/10 pl-8 md:ml-4"
        >
          {experience.map((job: any) => (
            <motion.li key={job.company} variants={rise} className="relative">
              <span
                aria-hidden
                className="absolute -left-[39px] top-7 h-3 w-3 rounded-full border-2 border-accent bg-canvas"
              />
              <motion.div
                whileHover={{ y: -4 }}
                transition={spring}
                className="rounded-2xl border border-white/10 bg-surface p-6 hover:border-accent/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold">
                    {job.role}, {job.company}
                  </h3>
                  <p className="text-sm text-muted">{job.dates}</p>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {job.achievements.map((a: string) => (
                    <li
                      key={a}
                      className="relative max-w-[70ch] pl-6 text-base leading-relaxed text-muted before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-3 before:bg-accent"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
