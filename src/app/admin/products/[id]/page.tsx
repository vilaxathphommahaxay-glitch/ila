import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/admin";
import {
  PRODUCT_STATUS_LABEL,
  type FormValues,
  type ProductStatus,
} from "../../../../lib/product-form";
import { updateProduct } from "../actions";
import ProductForm from "../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ตรวจสิทธิ์ก่อนเสมอ (คนที่ไม่ใช่แอดมินต้องไม่เห็นแม้แต่ 404 ของหน้านี้)
  const { supabase } = await requireAdmin();

  const { id } = await params;
  // รับเฉพาะเลขจำนวนเต็มบวกไม่เกิน 9 หลัก ที่เหลือคือ 404
  if (!/^\d{1,9}$/.test(id) || Number(id) < 1) notFound();

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, sku, slug, name, category_id, price_lak, compare_at_price_lak, description, status",
      )
      .eq("id", Number(id))
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  if (productResult.error || categoriesResult.error) {
    console.error(
      "admin edit product query failed:",
      productResult.error?.message,
      categoriesResult.error?.message,
    );
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ</p>
      </main>
    );
  }

  const product = productResult.data;
  if (!product) notFound();

  const status: ProductStatus = product.status;

  const initialValues: FormValues = {
    sku: product.sku,
    name: product.name,
    categoryId: product.category_id === null ? "" : String(product.category_id),
    priceLak: String(product.price_lak),
    compareAtPriceLak:
      product.compare_at_price_lak === null
        ? ""
        : String(product.compare_at_price_lak),
    description: product.description ?? "",
    status,
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin/products" className="text-sm text-neutral-500">
        ← ກັບລາຍການສິນຄ້າ
      </Link>
      <h1 className="mb-2 mt-2 text-xl font-semibold">ແກ້ໄຂສິນຄ້າ</h1>

      {status === "active" ? (
        <p className="mb-6 text-sm">
          <a
            href={`/p/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            ເບິ່ງໜ້າຮ້ານ
          </a>
        </p>
      ) : (
        <p className="mb-6 text-sm text-neutral-500">
          ລູກຄ້າຍັງບໍ່ເຫັນສິນຄ້ານີ້ (ສະຖານະ: {PRODUCT_STATUS_LABEL[status]})
        </p>
      )}

      {/* bind: ใส่ id ของสินค้าเข้าไปเป็นอาร์กิวเมนต์แรกของ action ล่วงหน้า */}
      <ProductForm
        mode="edit"
        action={updateProduct.bind(null, product.id)}
        initialValues={initialValues}
        categories={categoriesResult.data ?? []}
      />

      <p className="mt-8 text-sm text-neutral-500">
        ສີ/ໄຊສ໌ ແລະ ຮູບພາບ: ຈະເພີ່ມໃນຂັ້ນຕອນຕໍ່ໄປ
      </p>
    </main>
  );
}
