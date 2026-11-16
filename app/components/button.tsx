"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { spring } from "../../lib/motion";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const styles = {
  primary:
    "bg-accent font-semibold text-accent-ink shadow-glow hover:bg-cyan-300",
  ghost:
    "border border-white/15 font-medium text-ink hover:border-accent/60 hover:bg-white/5",
};

const tactile = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 },
  transition: spring,
};

export type Variant = keyof typeof styles;

interface LinkButtonProps extends HTMLMotionProps<"a"> {
  href: string;
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
}

export function LinkButton({
  href,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={tactile.whileHover}
      whileTap={tactile.whileTap}
      className={`inline-flex items-center justify-center gap-2 ${className || ""}`}
      {...props}
    >
      {children}
    </motion.a>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  className?: string;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`} />
  );
}
