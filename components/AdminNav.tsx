"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminNav({ active }: { active: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const items = [
    { href: "/admin", label: "📹 Videos", key: "videos" },
    { href: "/admin/categorias", label: "🏷️ Categorías", key: "categorias" },
    { href: "/admin/configuracion", label: "⚙️ Configuración", key: "config" },
  ];
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12', flexWrap: 'wrap', gap: '12px' }}>
      <nav className="admin-nav" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
        {items.map((i) => (
          <Link key={i.key} href={i.href} className={active === i.key ? "active" : ""}>
            {i.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href="/" className="btn secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
          🌐 Ver sitio
        </Link>
        <button 
          onClick={handleLogout} 
          className="btn danger" 
          style={{ fontSize: 12, padding: '6px 12px' }}
        >
          🚪 Salir
        </button>
      </div>
    </div>
  );
}
