import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "./env";

export const PHOTO_BUCKET = "private-photos";
const SIGNED_URL_SECONDS = 300;

export async function supabaseAuth() {
  const cookieStore = await cookies();
  return createServerClient(env().NEXT_PUBLIC_SUPABASE_URL, env().NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component: cookies são só leitura; o proxy renova a sessão.
        }
      },
    },
  });
}

function supabaseAdmin() {
  return createClient(env().NEXT_PUBLIC_SUPABASE_URL, env().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadPhoto(path: string, bytes: Buffer, contentType: string) {
  const { error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`UPLOAD_FAILED: ${error.message}`);
}

export async function signedPhotoUrl(path: string) {
  const { data, error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) throw new Error(`SIGN_FAILED: ${error.message}`);
  return data.signedUrl;
}

export async function deleteUserPhotos(userId: string) {
  const storage = supabaseAdmin().storage.from(PHOTO_BUCKET);
  const { data } = await storage.list(userId, { limit: 1000 });
  if (data?.length) await storage.remove(data.map((f) => `${userId}/${f.name}`));
}

export async function deleteAuthUser(userId: string) {
  const { error } = await supabaseAdmin().auth.admin.deleteUser(userId);
  if (error) throw new Error(`DELETE_USER_FAILED: ${error.message}`);
}

// Cria usuário já confirmado (sem e-mail): usado pelo painel admin para liberar testers.
export async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin().auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`CREATE_USER_FAILED: ${error?.message ?? "sem usuário"}`);
  return data.user.id;
}

export async function setAuthPassword(userId: string, password: string) {
  const { error } = await supabaseAdmin().auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(`SET_PASSWORD_FAILED: ${error.message}`);
}
