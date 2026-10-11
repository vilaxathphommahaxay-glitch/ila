import Link from "next/link";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  if (categoriesError) {
    return <main className="p-6">เกิดข้อผิดพลาด: {categoriesError.message}</main>;
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, price_lak, product_images(storage_path, sort_order)")
    .eq("status", "active")
    .order("id", { ascending: false })
    .limit(8)
    .order("sort_order", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" });

  if (productsError) {
    return <main className="p-6">เกิดข้อผิดพลาด: {productsError.message}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="text-5xl font-bold">ILa</h1>
        <p className="text-xl">ຍິນດີຕ້ອນຮັບສູ່ຮ້ານ ILa</p>
        <p className="text-neutral-500">ສິນຄ້າຈາກຈີນ ພ້ອມສົ່ງ</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/c/${category.slug}`}
                className="block rounded-full border px-4 py-2"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <h2 className="mt-6 mb-4 text-2xl font-bold">ສິນຄ້າໃໝ່</h2>

      {products.length === 0 ? (
        <p className="text-neutral-500">ຍັງບໍ່ມີສິນຄ້າ</p>
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