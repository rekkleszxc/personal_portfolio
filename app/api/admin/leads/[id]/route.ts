import { NextResponse } from "next/server";
import { isLeadStatus } from "@/lib/lead-status";
import { updateLeadStatus } from "@/lib/leads";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });
  }

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isLeadStatus(body.status)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 422 });
  }

  try {
    const updated = await updateLeadStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Could not update lead:", err);
    return NextResponse.json(
      { error: "Could not update lead." },
      { status: 500 },
    );
  }
}
