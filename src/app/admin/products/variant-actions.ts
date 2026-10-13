"use server";

// Server Action ของตัวเลือกสินค้า: เพิ่ม / เปลี่ยนสถานะสต็อก / ลบ
// ทุก action เรียก requireAdmin() เองก่อนเสมอ (Server Action คือช่อง POST ที่ใครก็ยิงตรงได้)
// ทำเสร็จแล้ว redirect กลับหน้าแก้ไขเดิม (หน้านั้นอ่านข้อมูลสดทุกครั้ง จึงไม่ต้องล้าง cache)
import { redirect, RedirectType } from "next/navigation";
import { requireAdmin } from "../../../lib/admin";
import {
  parseStockStatus,
  parseVariantForm,
  type VariantErrorCode,
} from "../../../lib/variant-form";

// กลับหน้าแก้ไขสินค้า (พร้อมรหัส error ถ้ามี)
// - สำเร็จ: redirect ไป URL เดิมเป๊ะ ไม่มี #hash -> หน้าโหลดข้อมูลใหม่ และตำแหน่งเลื่อนอยู่ที่เดิม
//   (ถ้าใส่แค่ #hash ต่อท้าย URL เดิม Next จะมองว่าเป็นแค่ "เลื่อนหน้า" แล้วไม่โหลดข้อมูลใหม่ — เทสต์เจอแล้ว)
// - ผิดพลาด: URL เปลี่ยนเป็น ?variantError=... จึงโหลดใหม่แน่นอน และ #variant-error
//   ทำให้หน้าเลื่อนไปเห็นข้อความ error ที่วางอยู่เหนือฟอร์มเพิ่มตัวเลือก
// replace = ไม่เพิ่มประวัติ "ย้อนกลับ" ทุกครั้งที่กดปุ่ม
function back(productId: number, error?: VariantErrorCode): never {
  const url = `/admin/products/${productId}`;
  redirect(error ? `${url}?variantError=${error}#variant-error` : url, RedirectType.replace);
}

function isId(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 2_147_483_647;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function addVariant(productId: number, formData: FormData) {
  const { supabase } = await requireAdmin();
  if (!isId(productId)) redirect("/admin/products");

  const parsed = parseVariantForm({
    color: text(formData, "color"),
    size: text(formData, "size"),
    stockStatus: text(formData, "stockStatus"),
  });
  if (!parsed) back(productId, "invalid");

  // ตัวเลือกใหม่ต่อท้ายสุด: sort_order = ค่ามากสุดที่มี + 1
  const { data: last, error: lastError } = await supabase
    .from("product_variants")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (lastError) {
    console.error("add variant: read sort_order failed:", lastError.code, lastError.message);
    back(productId, "failed");
  }
  const sortOrder = (last?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase
    .from("product_variants")
    .insert({ product_id: productId, ...parsed, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505") back(productId, "duplicate");
    if (error.code === "23503") back(productId, "notfound");
    console.error("add variant failed:", error.code, error.message);
    back(productId, "failed");
  }

  back(productId);
}

export async function setVariantStock(
  productId: number,
  variantId: number,
  formData: FormData,
) {
  const { supabase } = await requireAdmin();
  if (!isId(productId)) redirect("/admin/products");
  if (!isId(variantId)) back(productId, "notfound");

  const stock = parseStockStatus(formData.get("stockStatus"));
  if (!stock) back(productId, "invalid");

  // กรองด้วย product_id ด้วย: แก้ได้เฉพาะตัวเลือกที่เป็นของสินค้าชิ้นนี้จริง
  const { data, error } = await supabase
    .from("product_variants")
    .update({ stock_status: stock })
    .eq("id", variantId)
    .eq("product_id", productId)
    .select("id");

  if (error) {
    console.error("set variant stock failed:", error.code, error.message);
    back(productId, "failed");
  }
  if (!data || data.length === 0) back(productId, "notfound");

  back(productId);
}

export async function deleteVariant(productId: number, variantId: number) {
  const { supabase } = await requireAdmin();
  if (!isId(productId)) redirect("/admin/products");
  if (!isId(variantId)) back(productId, "notfound");

  const { data, error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId)
    .select("id");

  if (error) {
    console.error("delete variant failed:", error.code, error.message);
    back(productId, "failed");
  }
  if (!data || data.length === 0) back(productId, "notfound");

  back(productId);
}
