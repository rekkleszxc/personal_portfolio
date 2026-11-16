import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { recordLead } from "../../../lib/leads";
import { isDbConfigured } from "../../../lib/db";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadBody = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  page_url?: string;
};

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

function hashIp(ip: string) {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT ?? "portfolio-leads";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(req: Request) {
  let data: LeadBody;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof data.company === "string" && data.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = data.name?.trim() ?? "";
  const from = data.email?.trim() ?? "";
  const message = data.message?.trim() ?? "";
  if (!name || !EMAIL.test(from) || !message || message.length > 5000) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 422 },
    );
  }

  let saved = false;
  try {
    const id = await recordLead({
      name,
      email: from,
      message,
      source: data.source,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_term: data.utm_term,
      utm_content: data.utm_content,
      referrer: data.referrer,
      landing_page: data.landing_page,
      page_url: data.page_url,
      user_agent: req.headers.get("user-agent") ?? undefined,
      ip_hash: hashIp(clientIp(req)),
    });
    saved = id !== null;
  } catch (err) {
    console.error("Could not save lead:", err);
  }

  let delivered = false;
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio <onboarding@resend.dev>",
          to: [to],
          reply_to: from,
          subject: `New message from ${name}`,
          text: `${message}\n\n${name} <${from}>\nSource: ${data.source ?? "direct"}`,
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", res.status, await res.text());
      } else {
        delivered = true;
      }
    } catch (err) {
      console.error("Resend request failed:", err);
    }
  } else {
    console.log("Contact form message:", { name, from, message });
  }

  if (isDbConfigured() && !saved && !delivered) {
    return NextResponse.json(
      { error: "Couldn't save your message. Please email me directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
