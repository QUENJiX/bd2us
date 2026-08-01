import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  if (payload.website) return NextResponse.json({ ok: true });
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  if (name.length < 2 || !email.includes("@") || subject.length < 2 || message.length < 12) {
    return NextResponse.json({ error: "Please complete every field." }, { status: 400 });
  }
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Messages are temporarily unavailable. Please try again later." }, { status: 503 });
  const { error } = await supabase.from("feedback_messages").insert({ name, email, subject, message });
  if (error) return NextResponse.json({ error: "Your message was not saved. Please try again later." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
