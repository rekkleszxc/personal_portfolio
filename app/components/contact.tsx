"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "./button";
import CopyEmail from "./copyemail";
import { profile } from "../../lib/data";
import { spring } from "../../lib/motion";
import { readAttribution } from "../../lib/attribution";

type Field = "name" | "email" | "message";
type Values = Record<Field, string>;
type Status = "idle" | "loading" | "success" | "error";

function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (!v.name.trim()) e.name = "Name is required.";
  if (!v.email.trim())
    e.email = "Please provide an email so I can get back to you.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = "That email doesn't look right. Try name@example.com.";
  if (!v.message.trim()) e.message = "Message cannot be empty.";
  else if (v.message.length > 5000)
    e.message = "Keep it under 5,000 characters.";
  return e;
}

const field = (bad: boolean) =>
  `w-full rounded-xl border bg-canvas/70 px-4 py-3 text-base text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${bad ? "border-danger" : "border-white/15"}`;

const cardClass =
  "flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-surface p-4 text-left hover:border-accent/40";

export default function Contact() {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [company, setCompany] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animate(contactRef.current?.children || [], {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(150),
      duration: 800,
      easing: "easeOutExpo",
    });
  }, []);

  const errors = validate(values);
  const show = (f: Field) => (touched[f] || attempted ? errors[f] : undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const first = (["name", "email", "message"] as Field[]).find(
      (f) => errors[f],
    );
    if (first)
      return form.current
        ?.querySelector<HTMLElement>(`[name=${first}]`)
        ?.focus();

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          ...readAttribution(),
          company,
        }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => null))?.error ??
            "Something went wrong.",
        );
      setStatus("success");
      setValues({ name: "", email: "", message: "" });
      setTouched({});
      setAttempted(false);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setStatus("error");
    }
  };

  const row = (f: Field, label: string, control: React.ReactNode) => (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={f} className="text-[15px] font-semibold">
          {label}
        </label>
        <p
          id={`${f}-error`}
          aria-live="polite"
          className="text-sm font-medium text-danger"
        >
          {show(f)}
        </p>
      </div>
      {control}
    </div>
  );

  const props = (f: Field) => ({
    id: f,
    name: f,
    value: values[f],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setValues((v) => ({ ...v, [f]: e.target.value }));
      if (status !== "loading") setStatus("idle");
    },
    onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
    "aria-invalid": !!show(f),
    "aria-describedby": `${f}-error`,
  });

  return (
    <section id="contact" className="border-t border-white/10 py-24">
      <div
        ref={contactRef}
        className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1.2fr]"
      >
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Let's talk about your project
          </h2>
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted">
            Tell me what you're building and when you need it. I usually reply
            within two working days.
          </p>
          <div className="mt-8 space-y-3">
            <CopyEmail
              wrapperClassName="block"
              className={cardClass}
              renderAction={(copied) => (
                <>
                  <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
                    <Mail size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm text-muted">Email</span>
                    <span className="block text-base font-medium">
                      {profile.email}
                    </span>
                  </span>
                  {copied ? (
                    <Check size={18} className="text-success" />
                  ) : (
                    <Copy size={18} className="text-muted" />
                  )}
                </>
              )}
            />
            {[
              { label: "LinkedIn", href: profile.linkedin, Icon: Linkedin },
              { label: "GitHub", href: profile.github, Icon: Github },
              { label: "Facebook", href: profile.facebook, Icon: Facebook },
              { label: "Instagram", href: profile.instagram, Icon: Instagram },
            ].map(({ label, href, Icon }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className={cardClass}
              >
                <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
                  <Icon size={20} />
                </span>
                <span className="text-base font-medium">{label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        <form
          ref={form}
          onSubmit={submit}
          noValidate
          className="relative rounded-[24px] border border-white/10 bg-surface p-6 md:p-8"
        >
          <div className="space-y-8">
            {row(
              "name",
              "Name",
              <input
                {...props("name")}
                type="text"
                autoComplete="name"
                className={field(!!show("name"))}
              />,
            )}
            {row(
              "email",
              "Email address",
              <input
                {...props("email")}
                type="email"
                autoComplete="email"
                className={field(!!show("email"))}
              />,
            )}
            {row(
              "message",
              "Message",
              <textarea
                {...props("message")}
                rows={5}
                className={`${field(!!show("message"))} resize-y`}
              />,
            )}
          </div>

          <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending
                </>
              ) : (
                "Send message"
              )}
            </Button>
            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.p
                  key="ok"
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success"
                >
                  <CheckCircle2 size={16} /> Message sent. I'll reply soon.
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  key="err"
                  role="alert"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
                >
                  <AlertCircle size={16} /> {serverError} You can also email me
                  directly.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </section>
  );
}
