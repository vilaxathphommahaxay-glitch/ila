import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import ProductCard from "../../../components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError) {
    return <main className="p-6">เกิดข้อผิดพลาด: {categoryError.message}</main>;
  }

  if (!category) {
    notFound();
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price_lak, product_images(storage_path, sort_order)")
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("id", { ascending: false })
    .order("sort_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" });

  if (error) {
    return <main className="p-6">เกิดข้อผิดพลาด: {error.message}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-neutral-500">
        ← ກັບໜ້າຫຼັກ
      </Link>

      <h1 className="mt-4 mb-6 text-3xl font-bold">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-neutral-500">ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                slug={product.slug}
                name={product.name}
                priceLak={product.price_lak}
                coverPath={product.product_images[0]?.storage_path}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}