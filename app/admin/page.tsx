"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/AdminNav";
import type { Video, Category } from "@/lib/types";

export default function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });
    setVideos((data as Video[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublished(v: Video) {
    await supabase.from("videos").update({ published: !v.published }).eq("id", v.id);
    load();
    triggerRevalidate(["/", `/video/${v.slug}`]);
  }

  async function remove(v: Video) {
    if (!confirm(`¿Borrar "${v.title}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("videos").delete().eq("id", v.id);
    load();
    triggerRevalidate(["/", `/video/${v.slug}`]);
  }

  async function triggerRevalidate(paths: string[]) {
    try {
      await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });
    } catch {
      // no bloquea la UI si falla
    }
  }

  const filtered = filter
    ? videos.filter((v) => v.category?.slug === filter)
    : videos;

  const categorySlugs = Array.from(
    new Map(videos.filter((v) => v.category).map((v) => [v.category!.slug, v.category!.name])).entries()
  );

  return (
    <main className="admin-shell">
      <AdminNav active="videos" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 className="display" style={{ fontSize: 22 }}>
          Videos
        </h1>
        <Link href="/admin/videos/nuevo" className="btn">
          + Publicar video
        </Link>
      </div>

      {categorySlugs.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn secondary"
            style={{ borderColor: filter === "" ? "var(--accent)" : undefined }}
            onClick={() => setFilter("")}
          >
            Todas
          </button>
          {categorySlugs.map(([slug, name]) => (
            <button
              key={slug}
              className="btn secondary"
              style={{ borderColor: filter === slug ? "var(--accent)" : undefined }}
              onClick={() => setFilter(slug)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          cargando...
        </p>
      ) : filtered.length === 0 ? (
        <div className="empty">Todavía no hay videos publicados.</div>
      ) : (
        filtered.map((v) => (
          <div key={v.id} className="table-row">
            {v.thumbnail_url ? (
              <img src={v.thumbnail_url} className="swatch" alt="" />
            ) : (
              <div className="swatch" />
            )}
            <div className="t">{v.title}</div>
            <div className="meta">{v.clicks} clicks</div>
            <div className="meta" style={{ opacity: v.published ? 1 : 0.5 }}>
              {v.published ? "publicado" : "oculto"}
            </div>
            <Link href={`/admin/videos/${v.id}/editar`} className="btn secondary">
              Editar
            </Link>
            <button className="btn secondary" onClick={() => togglePublished(v)}>
              {v.published ? "Ocultar" : "Publicar"}
            </button>
            <button className="btn danger" onClick={() => remove(v)}>
              Borrar
            </button>
          </div>
        ))
      )}
    </main>
  );
}
