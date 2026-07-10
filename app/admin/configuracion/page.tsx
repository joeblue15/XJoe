"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/AdminNav";
import type { SiteSettings } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => setSettings(data as SiteSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    await supabase
      .from("site_settings")
      .update({ site_name: settings.site_name, tagline: settings.tagline })
      .eq("id", 1);
    setSaving(false);

    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/"] }),
    }).catch(() => {});

    setToast("Guardado — se refleja en el sitio al instante.");
    setTimeout(() => setToast(""), 3000);
  }

  if (!settings) {
    return (
      <main className="admin-shell">
        <AdminNav active="config" />
        <p className="mono" style={{ color: "var(--text-muted)" }}>
          cargando...
        </p>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <AdminNav active="config" />
      <h1 className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        Configuración del sitio
      </h1>

      <div className="field">
        <label>NOMBRE DEL SITIO</label>
        <input
          type="text"
          value={settings.site_name}
          onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
        />
      </div>
      <div className="field">
        <label>TAGLINE (opcional, para meta description)</label>
        <input
          type="text"
          value={settings.tagline ?? ""}
          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
        />
      </div>

      <button className="btn" disabled={saving} onClick={handleSave}>
        {saving ? "Guardando..." : "Guardar"}
      </button>

      {toast && (
        <p className="mono" style={{ color: "var(--accent)", fontSize: 13, marginTop: 14 }}>
          {toast}
        </p>
      )}
    </main>
  );
}
