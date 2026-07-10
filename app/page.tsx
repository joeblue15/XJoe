import { createClient } from "@/lib/supabase/server";
import CategoryPills from "@/components/CategoryPills";
import InfiniteGrid from "@/components/InfiniteGrid";
import type { Category } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <main className="page">
      <CategoryPills categories={(categories as Category[]) ?? []} />
      <InfiniteGrid />
    </main>
  );
}
