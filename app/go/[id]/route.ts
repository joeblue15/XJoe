import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: video } = await supabase
    .from("videos")
    .select("source_url")
    .eq("id", id)
    .single();

  if (!video) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  // Fire-and-forget: no bloquea el redirect. Anónimo, sin sesión de usuario.
  supabase.rpc("increment_video_clicks", { video_id: id }).then(() => {});

  return NextResponse.redirect(video.source_url, { status: 302 });
}
