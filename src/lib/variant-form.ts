// กติกาและการตรวจข้อมูลของ "ตัวเลือกสินค้า" (สี / ไซซ์ / สถานะสต็อก)
// ฟังก์ชันล้วน ไม่แตะฐานข้อมูล ไม่พึ่ง Next.js จึงทดสอบแยกได้

export const STOCK_STATUSES = ["in_stock", "low", "sold_out"] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

// ป้ายชื่อเดียวกับที่หน้าร้านแสดงให้ลูกค้า
export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "ມີສິນຄ້າ",
  low: "ເຫຼືອໜ້ອຍ",
  sold_out: "ໝົດ",
};

// ข้อความ error ของส่วนตัวเลือก — ส่งผ่าน URL เป็น "รหัส" (?variantError=duplicate)
// หน้าเว็บแปลงรหัสเป็นข้อความเองจากตารางนี้ จึงใส่ข้อความอื่นผ่าน URL ไม่ได้
export const VARIANT_ERRORS = {
  invalid: "ກະລຸນາໃສ່ສີ ຫຼື ໄຊສ໌ ຢ່າງໜ້ອຍ 1 ຢ່າງ (ບໍ່ເກີນ 50 ຕົວອັກສອນ)",
  duplicate: "ມີຕົວເລືອກນີ້ແລ້ວ",
  notfound: "ບໍ່ພົບຕົວເລືອກ",
  failed: "ບັນທຶກບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່",
} as const;
export type VariantErrorCode = keyof typeof VARIANT_ERRORS;

const VARIANT_ERROR_CODES = Object.keys(VARIANT_ERRORS) as VariantErrorCode[];

// รับค่าอะไรก็ได้จาก URL แล้วคืนเฉพาะรหัสที่รู้จัก (ค่าอื่น/ซ้ำ/แปลก = ไม่มี error)
export function toVariantErrorCode(raw: unknown): VariantErrorCode | undefined {
  return VARIANT_ERROR_CODES.find((code) => code === raw);
}

export function parseStockStatus(raw: unknown): StockStatus | undefined {
  return STOCK_STATUSES.find((s) => s === raw);
}

// แถวตัวเลือกที่อ่านจากฐานข้อมูล
export type VariantRow = {
  id: number;
  color: string | null;
  size: string | null;
  stock_status: StockStatus;
};

// ชื่อคอลัมน์ตรงกับตาราง product_variants
export type VariantInput = {
  color: string | null;
  size: string | null;
  stock_status: StockStatus;
};

// ช่องว่าง = ไม่มีค่า (NULL) ไม่เก็บ '' เพราะฐานข้อมูลถือว่า '' กับ NULL ต่างกัน
// ทำให้ (ดำ, ว่าง) กับ (ดำ, NULL) กลายเป็นตัวเลือกซ้ำกันโดยไม่รู้ตัว
function cleanText(raw: string): string | null {
  const text = raw.trim();
  return text === "" ? null : text;
}

// คืน null เมื่อข้อมูลไม่ผ่าน
export function parseVariantForm(raw: {
  color: string;
  size: string;
  stockStatus: string;
}): VariantInput | null {
  const color = cleanText(raw.color);
  const size = cleanText(raw.size);
  const stock = parseStockStatus(raw.stockStatus);

  if (!stock) return null;
  if (color === null && size === null) return null; // ต้องมีอย่างน้อยสีหรือไซซ์
  if ((color?.length ?? 0) > 50 || (size?.length ?? 0) > 50) return null;

  return { color, size, stock_status: stock };
}
