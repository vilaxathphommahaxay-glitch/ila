// ด่านตรวจสิทธิ์แอดมิน — เรียกที่บรรทัดแรกของ "ทุกหน้า" และ "ทุก action" ในส่วน /admin
// (ห้ามพึ่ง layout เพราะ layout ไม่รันซ้ำเวลาเปลี่ยนหน้า)
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  // ชั้นที่ 1: ล็อกอินจริงไหม
  // getClaims() ตรวจ token กับ Supabase ไม่ได้เชื่อ cookie เฉยๆ
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    redirect("/admin/login");
  }

  // ชั้นที่ 2: เป็นแอดมินไหม — ถามฐานข้อมูลผ่านฟังก์ชัน is_admin()
  // (สร้างไว้ใน db/phase5_admin.sql จึงมีกฎเดียวทั้งฝั่งเว็บและฐานข้อมูล)
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    redirect("/admin/login");
  }

  return {
    supabase,
    userId: data.claims.sub,
    email: data.claims.email,
  };
}
