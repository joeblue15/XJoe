import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import SearchBar from "@/components/SearchBar";
import UserMenu from "@/components/UserMenu";
import { getSiteSettings } from "@/lib/site-settings";

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
    <html lang="es" className="bg-background">
      <body>
        <header className="site-header">
          <div className="header-row">
            <Link href="/" className="logo display">
              {settings.site_name}
            </Link>
            <SearchBar />
            <UserMenu />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
