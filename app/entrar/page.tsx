"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin-email";

export default function EntrarPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    const dest = data.user?.email === ADMIN_EMAIL ? "/admin" : "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <h1 className="display auth-title">Entrar</h1>
      <p className="auth-sub mono">Accede a tu cuenta de VerYA</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>CORREO</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label>CONTRASEÑA</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button
          className="btn"
          type="submit"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="auth-switch mono">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </main>
  );
}
