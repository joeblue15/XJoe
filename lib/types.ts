export type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  icon: string | null;
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  source_url: string;
  source_domain: string;
  category_id: string | null;
  category?: Category | null;
  tags: string[] | null;
  clicks: number;
  views: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  tagline: string | null;
  updated_at: string;
};
