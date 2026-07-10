import InfiniteGrid from "@/components/InfiniteGrid";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <main className="page">
      <h1 className="display" style={{ fontSize: 20, marginBottom: 16 }}>
        {q ? `Resultados para "${q}"` : "Buscar"}
      </h1>
      {q ? <InfiniteGrid searchQuery={q} /> : (
        <div className="empty">Escribe algo en la barra de arriba.</div>
      )}
    </main>
  );
}
