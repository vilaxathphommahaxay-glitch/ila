"use server";

// Server Action ของส่วนแอดมิน: ล็อกอิน และ ออกจากระบบ
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase-server";

export async function signIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // ตรวจรูปแบบข้อมูลก่อน (กันค่าแปลกๆ / ยาวผิดปกติ)
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length === 0 ||
    email.length > 254 ||
    password.length === 0 ||
    password.length > 128
  ) {
    redirect("/admin/login?error=1");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  // ข้อความ error เดียวกันทุกกรณี ไม่บอกว่า "อีเมลไม่มี" หรือ "รหัสผิด"
  if (error) {
    redirect("/admin/login?error=1");
  }

  // ล็อกอินผ่านแล้ว แต่ต้องเป็นแอดมินด้วย ไม่งั้นเตะออกและล้าง session
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
