import { createClient } from "@supabase/supabase-js";
import CategoryPills from "@/components/CategoryPills";
import InfiniteGrid from "@/components/InfiniteGrid";
import type { Category } from "@/lib/types";

export const revalidate = 300;

export default async function HomePage() {
  // Public, cookie-less client so the category list can be cached/prerendered.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
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
