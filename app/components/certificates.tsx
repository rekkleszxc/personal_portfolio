"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Award } from "lucide-react";
import { certificates } from "../../lib/data";
import { rise, spring, stagger, viewport } from "../../lib/motion";

export default function Certificates() {
  return (
    <section id="certificates" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="font-display text-3xl font-bold tracking-tight md:text-4xl"
        >
          Certificates
        </motion.h2>
        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-3 max-w-lg text-base text-muted"
        >
          Courses and credentials I have completed along the way.
        </motion.p>

        <motion.ul
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {certificates.map((c) => (
            <motion.li key={c.title} variants={rise} className="flex">
              <motion.article
                whileHover={{ y: -6 }}
                transition={spring}
                className="group relative flex w-full flex-col rounded-[24px] border border-white/10 bg-surface p-3 hover:border-accent/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
                  <Image
                    src={c.image}
                    alt={`${c.title} certificate`}
                    fill
                    unoptimized
                    sizes="(min-width:1024px) 360px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                  <h3 className="font-display text-xl font-semibold">
                    {c.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-base text-muted">
                    <Award size={16} className="text-accent" />
                    {c.issuer} · {c.date}
                  </p>
                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center gap-1 pt-5 text-base font-semibold text-accent hover:underline underline-offset-4"
                    >
                      View credential <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              </motion.article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
