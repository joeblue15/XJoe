"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/lib/types";
import VideoCard from "./VideoCard";

const PAGE_SIZE = 20;

export default function InfiniteGrid({
  categoryId,
  searchQuery,
}: {
  categoryId?: string;
  searchQuery?: string;
}) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadPage = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      let query = supabase
        .from("videos")
        .select("*, category:categories(*)")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);

      if (categoryId) query = query.eq("category_id", categoryId);
      if (searchQuery) query = query.textSearch("title", searchQuery, { type: "websearch" });

      const { data, error } = await query;
      if (!error && data) {
        setVideos((prev) => (pageIndex === 0 ? data : [...prev, ...(data as Video[])]));
        if (data.length < PAGE_SIZE) setDone(true);
      }
      setLoading(false);
    },
    [categoryId, searchQuery, supabase]
  );

  // Reinicia cuando cambia el filtro de categoría o la búsqueda
  useEffect(() => {
    setVideos([]);
    setPage(0);
    setDone(false);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, searchQuery]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !done) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, loading, done, loadPage]);

  if (!loading && videos.length === 0) {
    return <div className="empty">No encontramos nada con eso. Prueba otra búsqueda.</div>;
  }

  return (
    <>
      <div className="grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      <div ref={sentinelRef} className="sentinel" />
      {loading && <div className="loading-row">cargando más...</div>}
    </>
  );
}
