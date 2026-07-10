"use client";

import { useEffect, useState } from "react";
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

export default function CategoriesAdminPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [toast, setToast] = useState("");

  async function load() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    setCategories((data as Category[]) ?? []);

    const { data: videos } = await supabase.from("videos").select("category_id");
    const counts: Record<string, number> = {};
    (videos ?? []).forEach((v: { category_id: string | null }) => {
      if (v.category_id) counts[v.category_id] = (counts[v.category_id] ?? 0) + 1;
    });
    setVideoCounts(counts);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const slug = slugify(newName);
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.display_order), 0);
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug,
      display_order: maxOrder + 1,
    });
    if (error) {
      showToast("Error: " + error.message);
      return;
    }
    setNewName("");
    load();
    showToast("Categoría creada");
  }

  async function handleUpdate() {
    if (!editing) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editing.name, slug: slugify(editing.name), display_order: editing.display_order })
      .eq("id", editing.id);
    if (error) {
      showToast("Error: " + error.message);
      return;
    }
    setEditing(null);
    load();
    showToast("Categoría actualizada");
  }

  async function handleDelete(c: Category) {
    const count = videoCounts[c.id] ?? 0;
    const message =
      count > 0
        ? `Esta categoría tiene ${count} video${count === 1 ? "" : "s"}. Al borrarla, quedarán sin categoría (no se borran los videos). ¿Continuar?`
        : `¿Borrar la categoría "${c.name}"?`;
    if (!confirm(message)) return;

    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) {
      showToast("Error: " + error.message);
      return;
    }
    load();
    showToast("Categoría borrada");
  }

  async function move(c: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];

    await supabase.from("categories").update({ display_order: other.display_order }).eq("id", c.id);
    await supabase.from("categories").update({ display_order: c.display_order }).eq("id", other.id);
    load();
  }

  return (
    <main className="admin-shell">
      <AdminNav active="categorias" />
      <h1 className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        Categorías
      </h1>

      <div className="url-row" style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nombre de la nueva categoría (ej. Otras)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button className="btn" onClick={handleCreate}>
          + Agregar
        </button>
      </div>

      {categories.map((c, i) => (
        <div key={c.id} className="table-row">
          {editing?.id === c.id ? (
            <>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                style={{
                  flex: 1,
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  padding: "6px 10px",
                  borderRadius: 5,
                }}
              />
              <button className="btn secondary" onClick={handleUpdate}>
                Guardar
              </button>
              <button className="btn secondary" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div className="t">{c.name}</div>
              <div className="meta">{videoCounts[c.id] ?? 0} videos</div>
              <button className="btn secondary" onClick={() => move(c, -1)} disabled={i === 0}>
                ↑
              </button>
              <button
                className="btn secondary"
                onClick={() => move(c, 1)}
                disabled={i === categories.length - 1}
              >
                ↓
              </button>
              <button className="btn secondary" onClick={() => setEditing(c)}>
                Editar
              </button>
              <button className="btn danger" onClick={() => handleDelete(c)}>
                Borrar
              </button>
            </>
          )}
        </div>
      ))}

      {toast && (
        <p className="mono" style={{ color: "var(--accent)", fontSize: 13, marginTop: 14 }}>
          {toast}
        </p>
      )}
    </main>
  );
}
