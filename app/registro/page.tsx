"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("already")
          ? "Este correo ya está registrado."
          : "No se pudo crear la cuenta. Intenta de nuevo."
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="auth-shell">
        <h1 className="display auth-title">Revisa tu correo</h1>
        <p className="auth-sub mono">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>.
          Ábrelo para activar tu cuenta y luego inicia sesión.
        </p>
        <Link href="/entrar" className="btn" style={{ width: "100%", textAlign: "center", display: "block" }}>
          Ir a entrar
        </Link>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <h1 className="display auth-title">Crear cuenta</h1>
      <p className="auth-sub mono">Únete a VerYA</p>
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
            autoComplete="new-password"
            required
          />
        </div>
        <div className="field">
          <label>CONFIRMAR CONTRASEÑA</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
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
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="auth-switch mono">
        ¿Ya tienes cuenta? <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}
