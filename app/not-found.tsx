import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 10 }}>
        No encontrado
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
        Ese video o categoría no existe o fue eliminado.
      </p>
      <Link href="/" className="btn" style={{ textDecoration: "none" }}>
        Volver al inicio
      </Link>
    </main>
  );
}
