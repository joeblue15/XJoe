import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export { ADMIN_EMAIL } from "@/lib/admin-email";

// SOLO usar en route handlers / server actions. Nunca importar desde un
// componente que pueda terminar en el bundle del cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
