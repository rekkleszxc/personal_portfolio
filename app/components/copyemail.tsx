"use client";

import { AnimatePresence, motion } from "framer-motion";
import { profile } from "../../lib/data";
import { spring } from "../../lib/motion";
import { useCopy } from "../../lib/usecopy";

type Props = {
  className?: string;
  wrapperClassName?: string;
  renderAction: (copied: boolean) => React.ReactNode;
};

export default function CopyEmail({
  className = "",
  wrapperClassName = "",
  renderAction,
}: Props) {
  const { copied, copy } = useCopy(profile.email);
  return (
    <span className={`relative ${wrapperClassName}`}>
      <motion.button
        type="button"
        onClick={copy}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        className={className}
      >
        {renderAction(copied)}
      </motion.button>
      <AnimatePresence>
        {copied && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-canvas"
          >
            Email copied
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}