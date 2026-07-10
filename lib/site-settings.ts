import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "VerYA",
  tagline: "",
  updated_at: "",
};

// Public, cookie-less client so the read can be cached across requests.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    return (data as SiteSettings) ?? DEFAULT_SETTINGS;
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 3600 }
);
