import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";

export const revalidate = 3600;

async function getVideo(slug: string): Promise<Video | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data as Video | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) return {};
  return {
    title: video.title,
    description: video.description ?? video.title,
    openGraph: {
      title: video.title,
      description: video.description ?? video.title,
      images: video.thumbnail_url ? [video.thumbnail_url] : [],
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: video.thumbnail_url ? [video.thumbnail_url] : undefined,
    uploadDate: video.created_at,
    contentUrl: video.source_url,
    embedUrl: video.source_url,
  };

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="thumb" style={{ borderRadius: 6, marginBottom: 16 }}>
        {video.thumbnail_url && (
          <img src={video.thumbnail_url} alt={video.title} />
        )}
        <div className="domain-tag">{video.source_domain}</div>
      </div>

      <h1 className="display" style={{ fontSize: 26, marginBottom: 8 }}>
        {video.title}
      </h1>

      {video.category && (
        <Link href={`/categoria/${video.category.slug}`} className="cat-pill" style={{ display: "inline-block", marginBottom: 14 }}>
          {video.category.name}
        </Link>
      )}

      {video.description && (
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          {video.description}
        </p>
      )}

      <a href={`/go/${video.id}`} className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
        Ver en {video.source_domain}
      </a>

      <p className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 24 }}>
        {video.clicks} clicks · publicado {new Date(video.created_at).toLocaleDateString("es-DO")}
      </p>
    </main>
  );
}
