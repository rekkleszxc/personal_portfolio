import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let data: { name?: string; email?: string; message?: string };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
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

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
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
        text: `${message}\n\n${name} <${from}>`,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Couldn't send your message." },
        { status: 502 },
      );
    }
  } else {
    console.log("Contact form message:", { name, from, message });
  }
  return NextResponse.json({ ok: true });
}
