import Link from "next/link";
import { requireAdmin } from "../../../../lib/admin";
import { EMPTY_VALUES } from "../../../../lib/product-form";
import { createProduct } from "../actions";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");

  if (error) {
    console.error("admin new product: categories query failed:", error.message);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin/products" className="text-sm text-neutral-500">
        ← ກັບລາຍການສິນຄ້າ
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-semibold">ເພີ່ມສິນຄ້າ</h1>

      <ProductForm
        mode="create"
        action={createProduct}
        initialValues={EMPTY_VALUES}
        categories={categories ?? []}
      />
    </main>
  );
}
