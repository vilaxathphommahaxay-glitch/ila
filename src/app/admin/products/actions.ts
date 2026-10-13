"use server";

// Server Action ของสินค้า: สร้างและแก้ไข
// Server Action คือช่อง POST ที่ใครก็ยิงตรงได้ ดังนั้นทุก action ต้องเรียก requireAdmin() เอง
// และตรวจข้อมูลซ้ำฝั่งเซิร์ฟเวอร์ทุกครั้ง (ห้ามเชื่อสิ่งที่ฟอร์มส่งมา)
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/admin";
import {
  parseProductForm,
  parseSku,
  readFormValues,
  toFormValues,
  type ProductFormState,
} from "../../../lib/product-form";

// แปลง error จากฐานข้อมูลเป็นข้อความของเราเอง (ไม่ส่งข้อความดิบออกหน้าจอ)
function describeDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "SKU ນີ້ມີຢູ່ແລ້ວ";
  if (error.code === "23503") return "ໝວດທີ່ເລືອກບໍ່ຖືກຕ້ອງ";
  console.error("product save failed:", error.code, error.message);
  return "ບັນທຶກບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່";
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();

  const values = readFormValues(formData);

  const sku = parseSku(values.sku);
  if (!sku.ok) return { values, error: sku.error };

  const parsed = parseProductForm(values);
  if (!parsed.ok) return { values, error: parsed.error };

  const { data, error } = await supabase
    .from("products")
    .insert({ sku: sku.sku, slug: sku.slug, ...parsed.data })
    .select("id")
    .single();

  if (error) return { values, error: describeDbError(error) };

  // สร้างเสร็จ พาไปหน้าแก้ไขของสินค้าชิ้นนั้น
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(
  id: number,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();

  const values = readFormValues(formData);

  if (!Number.isInteger(id) || id < 1) {
    return { values, error: "ບໍ່ພົບສິນຄ້າ" };
  }

  // SKU และ slug ไม่แก้ตอนอัปเดต (ลิงก์ที่แชร์ไปแล้วจะได้ไม่เสีย)
  const parsed = parseProductForm(values);
  if (!parsed.ok) return { values, error: parsed.error };

  const { data, error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id)
    .select("id");

  if (error) return { values, error: describeDbError(error) };
  // update ที่ไม่เจอแถวไม่ถือเป็น error ของฐานข้อมูล ต้องเช็กเอง
  if (!data || data.length === 0) return { values, error: "ບໍ່ພົບສິນຄ້າ" };

  return { values: toFormValues(values.sku, parsed.data), saved: true };
}
