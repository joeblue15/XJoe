import Link from "next/link";

export default function AdminNav({ active }: { active: string }) {
  const items = [
    { href: "/admin", label: "Videos", key: "videos" },
    { href: "/admin/categorias", label: "Categorías", key: "categorias" },
    { href: "/admin/configuracion", label: "Configuración", key: "config" },
  ];
  return (
    <nav className="admin-nav">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={active === i.key ? "active" : ""}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
