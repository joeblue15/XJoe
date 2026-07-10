"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verificar si ya está logueado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/admin");
      }
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 500);
  }

  return (
    <main className="admin-shell" style={{ maxWidth: 420, paddingTop: 60, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>
          Panel de Administración
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Ingresa tus credenciales para gestionar el contenido
        </p>
      </div>
      
      <div style={{ 
        background: "var(--bg-secondary)", 
        padding: "24px", 
        borderRadius: "12px",
        border: "1px solid var(--border)"
      }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{ fontSize: 14 }}
            />
          </div>
          <div className="field">
            <label>CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ fontSize: 14 }}
            />
          </div>
          {error && (
            <div style={{ 
              background: "rgba(255, 100, 100, 0.1)", 
              color: "#ff6464", 
              padding: "10px 14px", 
              borderRadius: "6px", 
              fontSize: 13, 
              marginBottom: 16,
              border: "1px solid rgba(255, 100, 100, 0.2)"
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ 
              background: "rgba(100, 255, 100, 0.1)", 
              color: "#64ff64", 
              padding: "10px 14px", 
              borderRadius: "6px", 
              fontSize: 13, 
              marginBottom: 16,
              border: "1px solid rgba(100, 255, 100, 0.2)"
            }}>
              ¡Login exitoso! Redirigiendo...
            </div>
          )}
          <button 
            className="btn" 
            type="submit" 
            disabled={loading || success} 
            style={{ width: "100%", padding: "12px", fontSize: 15 }}
          >
            {loading ? "Verificando..." : success ? "¡Listo!" : "Iniciar Sesión"}
          </button>
        </form>
      </div>
      
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <a 
          href="/" 
          style={{ 
            color: "var(--text-muted)", 
            fontSize: 13, 
            textDecoration: "none",
            "&:hover": { color: "var(--text)" }
          }}
        >
          ← Volver al sitio
        </a>
      </div>
    </main>
  );
}
