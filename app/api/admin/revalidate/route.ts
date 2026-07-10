import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/admin-email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { paths } = await request.json();
  const list: string[] = Array.isArray(paths) ? paths : [paths].filter(Boolean);
  list.forEach((p) => revalidatePath(p));

  // Refresh cached site settings (name/tagline in the header).
  revalidateTag("site-settings");
  // Ensure the home page picks up category changes immediately.
  revalidatePath("/");

  return NextResponse.json({ revalidated: list, now: Date.now() });
}
