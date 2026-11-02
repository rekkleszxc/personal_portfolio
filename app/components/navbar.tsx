"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LinkButton } from "./button";
import { navLinks, profile } from "../../lib/data";
import { spring } from "../../lib/motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const targets = navLinks
      .map((l: any) => document.querySelector(l.href))
      .filter((el): el is Element => !!el);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && setActive(`#${e.target.id}`),
        ),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t: Element) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3"
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-white/10 px-5 backdrop-blur-xl transition-colors ${scrolled ? "bg-canvas/80" : "bg-canvas/40"}`}
      >
        <a href="#top" className="font-display text-lg font-bold">
          {profile.name}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l: any) => (
            <li key={l.href} className="relative">
              <a
                href={l.href}
                className={`block rounded-lg px-3 py-2 text-[15px] font-medium transition-colors hover:text-ink ${active === l.href ? "text-ink" : "text-muted"}`}
              >
                {l.label}
              </a>
              {active === l.href && (
                <motion.span
                  layoutId="nav-active"
                  transition={spring}
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LinkButton href="#contact" className="!px-4 !py-2 text-[15px]">
            Let's talk
          </LinkButton>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="rounded-lg border border-white/15 p-2 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-white/10 bg-surface p-6 md:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="mb-6 self-end rounded-lg border border-white/15 p-2"
              >
                <X size={20} />
              </button>
              <ul className="space-y-1">
                {navLinks.map((l: any) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-3 text-lg font-medium hover:bg-white/5"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <LinkButton
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-auto"
              >
                Let's talk
              </LinkButton>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
