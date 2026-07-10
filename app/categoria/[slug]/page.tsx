import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryPills from "@/components/CategoryPills";
import InfiniteGrid from "@/components/InfiniteGrid";
import type { Category } from "@/lib/types";

export const revalidate = 3600;

async function getData(slug: string) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  const current = (categories as Category[] | null)?.find((c) => c.slug === slug);
  return { categories: (categories as Category[]) ?? [], current };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { current } = await getData(slug);
  if (!current) return {};
  return {
    title: `${current.name} — videos`,
    description: `Videos en la categoría ${current.name}.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, current } = await getData(slug);
  if (!current) notFound();

  return (
    <main className="page">
      <CategoryPills categories={categories} activeSlug={slug} />
      <InfiniteGrid categoryId={current.id} />
    </main>
  );
}
