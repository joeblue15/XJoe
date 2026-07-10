"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/AdminNav";
import type { Category, Video } from "@/lib/types";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [video, setVideo] = useState<Video | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [thumbnailMethod, setThumbnailMethod] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setVideo(data as Video));
    supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => setCategories((data as Category[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    if (!video) return;
    setSaving(true);
    await supabase
      .from("videos")
      .update({
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        source_url: video.source_url,
        category_id: video.category_id,
      })
      .eq("id", video.id);
    setSaving(false);

    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/", `/video/${video.slug}`] }),
    }).catch(() => {});

    router.push("/admin");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Error al subir imagen');
      
      const data = await res.json();
      setVideo({ ...video, thumbnail_url: data.url });
    } catch (error) {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  if (!video) {
    return (
      <main className="admin-shell">
        <AdminNav active="videos" />
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          cargando...
        </p>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <AdminNav active="videos" />
      <h1 className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        Editar video
      </h1>

      <div className="field">
        <label>TÍTULO</label>
        <input
          type="text"
          value={video.title}
          onChange={(e) => setVideo({ ...video, title: e.target.value })}
        />
      </div>
      <div className="field">
        <label>DESCRIPCIÓN</label>
        <textarea
          value={video.description ?? ""}
          onChange={(e) => setVideo({ ...video, description: e.target.value })}
        />
      </div>
      <div className="field">
        <label>URL DE ORIGEN</label>
        <input
          type="text"
          value={video.source_url}
          onChange={(e) => setVideo({ ...video, source_url: e.target.value })}
        />
      </div>
      <div className="field">
        <label>MÉTODO DE THUMBNAIL</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            type="button"
            className={`btn ${thumbnailMethod === 'url' ? '' : 'secondary'}`}
            onClick={() => setThumbnailMethod('url')}
            style={{ flex: 1 }}
          >
            URL de imagen
          </button>
          <button 
            type="button"
            className={`btn ${thumbnailMethod === 'upload' ? '' : 'secondary'}`}
            onClick={() => setThumbnailMethod('upload')}
            style={{ flex: 1 }}
          >
            Subir archivo
          </button>
        </div>
      </div>

      {thumbnailMethod === 'url' && (
        <div className="field">
          <label>URL DE IMAGEN</label>
          <input
            type="text"
            value={video.thumbnail_url ?? ""}
            onChange={(e) => setVideo({ ...video, thumbnail_url: e.target.value })}
          />
          {video.thumbnail_url && (
            <div style={{ marginTop: 8 }}>
              <img src={video.thumbnail_url} alt="Preview" style={{ width: 160, borderRadius: 6 }} />
            </div>
          )}
        </div>
      )}

      {thumbnailMethod === 'upload' && (
        <div className="field">
          <label>SUBIR IMAGEN</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Subiendo...</p>}
          {video.thumbnail_url && (
            <div style={{ marginTop: 8 }}>
              <img src={video.thumbnail_url} alt="Uploaded" style={{ width: 160, borderRadius: 6 }} />
            </div>
          )}
        </div>
      )}
      <div className="field">
        <label>CATEGORÍA</label>
        <select
          value={video.category_id ?? ""}
          onChange={(e) => setVideo({ ...video, category_id: e.target.value })}
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button className="btn" disabled={saving} onClick={handleSave}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </main>
  );
}
