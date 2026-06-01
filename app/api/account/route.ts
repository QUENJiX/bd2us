import { NextResponse } from "next/server";
import { getCurrentUser, getServiceSupabase } from "@/lib/supabase/server";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before deleting your account." }, { status: 401 });
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Account deletion is temporarily unavailable." }, { status: 503 });
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "Could not delete your account. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
