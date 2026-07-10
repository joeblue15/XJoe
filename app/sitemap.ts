import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const { data: videos } = await supabase
    .from("videos")
    .select("slug, updated_at")
    .eq("published", true);

  const { data: categories } = await supabase.from("categories").select("slug");

  const videoUrls: MetadataRoute.Sitemap = (videos ?? []).map((v) => ({
    url: `${base}/video/${v.slug}`,
    lastModified: v.updated_at,
    changeFrequency: "weekly",
  }));

  const categoryUrls: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    changeFrequency: "daily",
  }));

  return [{ url: base, changeFrequency: "daily", priority: 1 }, ...categoryUrls, ...videoUrls];
}
