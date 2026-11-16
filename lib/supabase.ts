import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Bypasses row-level security. Only use after requireAdmin().
export const adminDb = () =>
  createClient(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

// Supabase client tied to the visitor's login cookies.
export async function authClient() {
  const store = await cookies();
  return createServerClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components can't write cookies; proxy.ts refreshes them instead.
        }
      },
    },
  });
}

export async function requireAdmin() {
  const {
    data: { user },
  } = await (await authClient()).auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/admin/login");
}
