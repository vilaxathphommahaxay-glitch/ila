// Supabase client ฝั่งเซิร์ฟเวอร์ — ใช้ใน Server Component และ Server Action
// อ่าน session ของผู้ใช้จาก cookie ของ request นั้นๆ
// (ต่างจาก src/lib/supabase.ts ที่เป็น client กลางสำหรับหน้าร้าน ไม่มีตัวตนผู้ใช้)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              ...options,
              // httpOnly: JavaScript ในเบราว์เซอร์อ่าน cookie นี้ไม่ได้ (กันขโมย token ผ่าน XSS)
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            });
          }
        } catch {
          // Server Component เขียน cookie ไม่ได้ จึงปล่อยผ่าน
          // (Server Action เขียนได้ และตอนล็อกอิน/ออกจากระบบเราทำใน Server Action)
        }
      },
    },
  });
}
