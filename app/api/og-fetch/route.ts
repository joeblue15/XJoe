import { NextResponse, type NextRequest } from "next/server";

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

function ytIdFromUrl(url: string): string | null {
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?&]+)/, /youtube\.com\/live\/([^?&]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "Falta la URL" }, { status: 400 });

  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  // Atajo para YouTube: thumbnail pública garantizada + oEmbed para el título,
  // sin necesidad de descargar el HTML completo de la página.
  const ytId = domain.includes("youtube.com") || domain.includes("youtu.be") ? ytIdFromUrl(url) : null;
  if (ytId) {
    let title = "";
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        title = oembed.title ?? "";
      }
    } catch {
      // seguimos con título vacío, el admin lo completa a mano
    }
    return NextResponse.json({
      title,
      thumbnail_url: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      source_domain: "youtube.com",
    });
  }

  // Genérico: fetch del HTML y parseo de meta tags Open Graph
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VerYABot/1.0)" },
    });
    const html = await res.text();
    const title = extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title") ?? "";
    const image = extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image") ?? "";
    const siteName = extractMeta(html, "og:site_name") ?? domain;

    return NextResponse.json({
      title,
      thumbnail_url: image,
      source_domain: siteName || domain,
    });
  } catch {
    return NextResponse.json({
      title: "",
      thumbnail_url: "",
      source_domain: domain,
    });
  }
}
