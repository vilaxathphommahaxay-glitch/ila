import Link from "next/link";
import { requireAdmin } from "../../../lib/admin";
import { formatLak } from "../../../lib/format";
import { productImageUrl } from "../../../lib/storage";

const STATUSES = ["draft", "active", "hidden", "archived"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  draft: "ແບບຮ່າງ",
  active: "ເປີດຂາຍ",
  hidden: "ເຊື່ອງ",
  archived: "ປິດການຂາຍ",
};

type ProductRow = {
  id: number;
  sku: string;
  name: string;
  price_lak: number;
  status: Status;
  category_id: number | null;
  product_images: { storage_path: string; sort_order: number }[];
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  // ด่านตรวจสิทธิ์ต้องมาก่อนทุกอย่าง และใช้ client ที่ได้จากด่านนี้
  // (ล็อกอินในนามแอดมิน ไม่ใช่กุญแจพิเศษ — RLS ในฐานข้อมูลยังคุมอยู่)
  const { supabase } = await requireAdmin();

  // รับเฉพาะสถานะที่รู้จัก ค่าอื่นทั้งหมด (รวมค่าซ้ำ/แปลกๆ) ถือเป็น "ทั้งหมด"
  const { status: statusParam } = await searchParams;
  const status = STATUSES.find((s) => s === statusParam);

  let productsQuery = supabase
    .from("products")
    .select(
      "id, sku, name, price_lak, status, category_id, product_images(storage_path, sort_order)",
    );
  if (status) {
    productsQuery = productsQuery.eq("status", status);
  }

  const [productsResult, categoriesResult] = await Promise.all([
    productsQuery
      .order("id", { ascending: false })
      .limit(200)
      .order("sort_order", { referencedTable: "product_images" })
      .limit(1, { referencedTable: "product_images" }),
    supabase.from("categories").select("id, name"),
  ]);

  if (productsResult.error || categoriesResult.error) {
    console.error(
      "admin products query failed:",
      productsResult.error?.message,
      categoriesResult.error?.message,
    );
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ</p>
      </main>
    );
  }

  const products: ProductRow[] = productsResult.data ?? [];
  const categoryNames = new Map<number, string>(
    (categoriesResult.data ?? []).map((c) => [c.id, c.name]),
  );

  const tabs: { label: string; href: string; active: boolean }[] = [
    { label: "ທັງໝົດ", href: "/admin/products", active: !status },
    ...STATUSES.map((s) => ({
      label: STATUS_LABEL[s],
      href: `/admin/products?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm text-neutral-500">
        ← ກັບແຜງຜູ້ດູແລ
      </Link>

      <h1 className="mt-2 text-xl font-semibold">ສິນຄ້າ</h1>

      <nav className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-3 py-1 text-sm ${
              tab.active ? "font-semibold underline" : "text-neutral-500"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-sm text-neutral-500">
        {products.length} ລາຍການ
      </p>

      {products.length === 0 ? (
        <p className="mt-4">ບໍ່ມີສິນຄ້າ</p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-500/30">
          {products.map((p) => {
            const cover = p.product_images[0]?.storage_path;
            const categoryName =
              p.category_id === null ? undefined : categoryNames.get(p.category_id);
            return (
              <li key={p.id} className="flex items-center gap-3 py-3">
                {cover ? (
                  <img
                    src={productImageUrl(cover)}
                    alt=""
                    className="size-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded bg-neutral-800" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-500">
                    {p.sku} · {categoryName ?? "—"} · {formatLak(p.price_lak)}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
                  {STATUS_LABEL[p.status]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
