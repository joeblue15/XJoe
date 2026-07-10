"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form className="search-wrap" onSubmit={handleSubmit}>
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Buscar video, canción, clip..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
