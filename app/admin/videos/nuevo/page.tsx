"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/AdminNav";
import type { Category } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewVideoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [domain, setDomain] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => setCategories((data as Category[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFetch() {
    if (!url.trim()) return;
    setFetching(true);
    try {
      const res = await fetch("/api/og-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      setTitle(data.title || "");
      setThumbnail(data.thumbnail_url || "");
      setDomain(data.source_domain || "");
    } finally {
      setFetching(false);
    }
  }

  const descWordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const canPublish = title.trim() && descWordCount >= 20 && url.trim() && categoryId;

  async function handlePublish() {
    setSaving(true);
    const slugBase = slugify(title);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const { error } = await supabase.from("videos").insert({
      title: title.trim(),
      slug,
      description: description.trim(),
      thumbnail_url: thumbnail,
      source_url: url.trim(),
      source_domain: domain,
      category_id: categoryId,
      published: true,
    });

    setSaving(false);
    if (error) {
      setToast("Error al publicar: " + error.message);
      return;
    }

    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/", `/video/${slug}`] }),
    }).catch(() => {});

    router.push("/admin");
  }

  return (
    <main className="admin-shell">
      <AdminNav active="videos" />
      <h1 className="display" style={{ fontSize: 22, marginBottom: 4 }}>
        Publicar video
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
        Pega el link, trae la info automática, edita y publica.
      </p>

      <div className="field">
        <label>URL DEL VIDEO</label>
        <div className="url-row">
          <input
            type="text"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn secondary" onClick={handleFetch} disabled={fetching}>
            {fetching ? "Buscando..." : "Buscar info"}
          </button>
        </div>
      </div>

      {thumbnail && (
        <div style={{ marginBottom: 16 }}>
          <img 
            src={thumbnail} 
            alt="" 
            style={{ width: 160, borderRadius: 6 }} 
            onError={(e) => {
              e.currentTarget.src = "/default-thumbnail.png";
            }}
          />
          <p className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            og:site_name → {domain}
          </p>
        </div>
      )}

      <div className="field">
        <label>TÍTULO</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="field">
        <label>DESCRIPCIÓN PROPIA (mínimo 20 palabras — {descWordCount}/20)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="field">
        <label>CATEGORÍA</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Elige una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button className="btn" disabled={!canPublish || saving} onClick={handlePublish}>
        {saving ? "Publicando..." : "Publicar"}
      </button>

      {toast && <p style={{ color: "var(--accent)", marginTop: 12, fontSize: 13 }}>{toast}</p>}
    </main>
  );
}
