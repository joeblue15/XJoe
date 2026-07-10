import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import type { SiteSettings } from "@/lib/types";

async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  return (data as SiteSettings) ?? { id: 1, site_name: "VerYA", tagline: "", updated_at: "" };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_name,
    description: settings.tagline || settings.site_name,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="header-row">
            <Link href="/" className="logo display">
              {settings.site_name}
            </Link>
            <SearchBar />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
