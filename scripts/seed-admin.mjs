// Corre una sola vez: node scripts/seed-admin.mjs
// Crea (o confirma) el usuario admin en Supabase Auth con el correo fijo del proyecto.
// Requiere las env vars NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "josephqr2007@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("Falta SEED_ADMIN_PASSWORD en el entorno. Ej: SEED_ADMIN_PASSWORD=algo-seguro node scripts/seed-admin.mjs");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
});

if (error) {
  if (error.message.includes("already registered")) {
    console.log(`El usuario ${ADMIN_EMAIL} ya existe — no se creó de nuevo.`);
  } else {
    console.error("Error creando el admin:", error.message);
    process.exit(1);
  }
} else {
  console.log(`Admin creado: ${data.user.email}`);
}

console.log("Recuerda: la tabla admin_emails en supabase/schema.sql ya trae este correo autorizado.");
