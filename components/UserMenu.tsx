"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin-email";

export default function UserMenu({
  initialEmail,
}: {
  initialEmail: string | null;
}) {
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!email) {
    return (
      <div className="user-menu">
        <Link href="/entrar" className="btn secondary user-btn">
          Entrar
        </Link>
      </div>
    );
  }

  const isAdmin = email === ADMIN_EMAIL;
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
      >
        {initial}
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-email mono">{email}</div>
          {isAdmin && (
            <Link href="/admin" className="user-dropdown-item" role="menuitem">
              Panel admin
            </Link>
          )}
          <button
            type="button"
            className="user-dropdown-item danger-text"
            onClick={handleSignOut}
            role="menuitem"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
