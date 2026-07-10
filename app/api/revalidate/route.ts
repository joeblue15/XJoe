import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const { secret, paths } = await request.json();

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Secreto inválido" }, { status: 401 });
  }

  const list: string[] = Array.isArray(paths) ? paths : [paths].filter(Boolean);
  list.forEach((p) => revalidatePath(p));

  return NextResponse.json({ revalidated: list, now: Date.now() });
}
