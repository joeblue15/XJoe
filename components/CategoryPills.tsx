import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="cats">
      <Link href="/" className={`cat-pill ${!activeSlug ? "active" : ""}`}>
        Todos
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categoria/${c.slug}`}
          className={`cat-pill ${activeSlug === c.slug ? "active" : ""}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
