// กติกาและการตรวจข้อมูลของฟอร์มสินค้า
// เป็นฟังก์ชันล้วน ไม่แตะฐานข้อมูล ไม่พึ่ง Next.js จึงทดสอบแยกได้
// ใช้ได้ทั้งใน Server Action (ตรวจจริง) และ client component (ค่าคงที่ / ชนิดข้อมูล)

export const PRODUCT_STATUSES = ["draft", "active", "hidden", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "ແບບຮ່າງ",
  active: "ເປີດຂາຍ",
  hidden: "ເຊື່ອງ",
  archived: "ປິດການຂາຍ",
};

// ค่าในฟอร์มทุกช่องเป็น string เสมอ (เบราว์เซอร์ส่งมาแบบนี้)
export type FormValues = {
  sku: string;
  name: string;
  categoryId: string;
  priceLak: string;
  compareAtPriceLak: string;
  description: string;
  status: string;
};

// สิ่งที่ Server Action ส่งกลับให้ฟอร์ม: ค่าที่กรอก (เก็บไว้ไม่ให้หาย) + ข้อความ error/สำเร็จ
export type ProductFormState = {
  values: FormValues;
  error?: string;
  saved?: boolean;
};

export const EMPTY_VALUES: FormValues = {
  sku: "",
  name: "",
  categoryId: "",
  priceLak: "",
  compareAtPriceLak: "",
  description: "",
  status: "draft",
};

export function readFormValues(formData: FormData): FormValues {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    sku: get("sku"),
    name: get("name"),
    categoryId: get("categoryId"),
    priceLak: get("priceLak"),
    compareAtPriceLak: get("compareAtPriceLak"),
    description: get("description"),
    status: get("status"),
  };
}

// ---------- SKU / slug ----------

export type SkuResult =
  | { ok: true; sku: string; slug: string }
  | { ok: false; error: string };

export function parseSku(raw: string): SkuResult {
  const trimmed = raw.trim();
  // ตรวจเฉพาะ ASCII ก่อนแปลงเป็นตัวพิมพ์ใหญ่ (กันอักขระแปลกที่แปลงแล้วกลายเป็นตัวอื่น)
  const valid =
    trimmed.length >= 3 &&
    trimmed.length <= 32 &&
    /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(trimmed);
  if (!valid) {
    return {
      ok: false,
      error: "SKU ໃຊ້ໄດ້ສະເພາະ A-Z, 0-9 ແລະ - (3-32 ຕົວ) ເຊັ່ນ TEE-001",
    };
  }
  const sku = trimmed.toUpperCase();
  return { ok: true, sku, slug: sku.toLowerCase() };
}

// ---------- ข้อมูลสินค้า ----------

// ชื่อคอลัมน์ตรงกับตาราง products เพื่อส่งเข้า insert/update ได้เลย
export type ProductInput = {
  name: string;
  category_id: number;
  price_lak: number;
  compare_at_price_lak: number | null;
  description: string | null;
  status: ProductStatus;
};

export type ParseResult =
  | { ok: true; data: ProductInput }
  | { ok: false; error: string };

const MAX_PRICE = 1_000_000_000;

// รับเลขจำนวนเต็มไม่ติดลบเท่านั้น (ยอมให้พิมพ์ , หรือเว้นวรรคคั่นหลัก เช่น 150,000)
function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (!/^\d{1,10}$/.test(cleaned)) return null; // ช่องว่างจะไม่ผ่านตรงนี้ (ไม่กลายเป็น 0)
  const value = Number(cleaned);
  return value <= MAX_PRICE ? value : null;
}

export function parseProductForm(values: FormValues): ParseResult {
  const fail = (error: string): ParseResult => ({ ok: false, error });

  const name = values.name.trim();
  if (name.length === 0 || name.length > 200) {
    return fail("ກະລຸນາໃສ່ຊື່ສິນຄ້າ (ບໍ່ເກີນ 200 ຕົວອັກສອນ)");
  }

  const categoryRaw = values.categoryId.trim();
  if (!/^\d{1,9}$/.test(categoryRaw) || Number(categoryRaw) < 1) {
    return fail("ກະລຸນາເລືອກໝວດ");
  }

  const price = parseMoney(values.priceLak);
  if (price === null) {
    return fail("ລາຄາຕ້ອງເປັນຕົວເລກຈຳນວນເຕັມ ແລະ ບໍ່ເກີນ 1,000,000,000");
  }

  let compareAt: number | null = null;
  if (values.compareAtPriceLak.trim() !== "") {
    compareAt = parseMoney(values.compareAtPriceLak);
    if (compareAt === null || compareAt <= price) {
      return fail("ລາຄາກ່ອນຫຼຸດຕ້ອງເປັນຕົວເລກ ແລະ ຫຼາຍກວ່າລາຄາຂາຍ");
    }
  }

  // เบราว์เซอร์ส่งการขึ้นบรรทัดใหม่ใน textarea มาเป็น \r\n เก็บเป็น \n แบบเดียวกันทั้งระบบ
  const description = values.description.replace(/\r\n?/g, "\n").trim();
  if (description.length > 5000) {
    return fail("ລາຍລະອຽດຍາວເກີນໄປ (ບໍ່ເກີນ 5000 ຕົວອັກສອນ)");
  }

  const status = PRODUCT_STATUSES.find((s) => s === values.status);
  if (!status) {
    return fail("ສະຖານະບໍ່ຖືກຕ້ອງ");
  }

  return {
    ok: true,
    data: {
      name,
      category_id: Number(categoryRaw),
      price_lak: price,
      compare_at_price_lak: compareAt,
      description: description === "" ? null : description,
      status,
    },
  };
}

// แปลงข้อมูลที่ตรวจแล้วกลับเป็นค่าในฟอร์ม (หลังบันทึก จะแสดงเลขเป็นรูปแบบมาตรฐาน เช่น 175,000 -> 175000)
export function toFormValues(sku: string, input: ProductInput): FormValues {
  return {
    sku,
    name: input.name,
    categoryId: String(input.category_id),
    priceLak: String(input.price_lak),
    compareAtPriceLak:
      input.compare_at_price_lak === null ? "" : String(input.compare_at_price_lak),
    description: input.description ?? "",
    status: input.status,
  };
}
