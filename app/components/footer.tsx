"use client";
import { motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { profile } from "../../lib/data";
import { spring } from "../../lib/motion";

const socials = [
  { label: "GitHub", href: profile.github, Icon: Github },
  { label: "LinkedIn", href: profile.linkedin, Icon: Linkedin },
  { label: "Email", href: `mailto:${profile.email}`, Icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <ul className="flex items-center gap-2">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <motion.a
                href={href}
                aria-label={label}
                whileHover={{ scale: 1.15, y: -2 }}
                transition={spring}
                className="block rounded-lg p-2 hover:text-ink"
              >
                <Icon size={18} />
              </motion.a>
            </li>
          ))}
        </ul>
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 hover:border-accent/60 hover:text-ink"
        >
          Back to top <ArrowUp size={16} />
        </motion.button>
      </div>
    </footer>
  );
}
