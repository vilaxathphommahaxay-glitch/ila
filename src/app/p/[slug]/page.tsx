import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { formatLak } from "../../../lib/format";

const STOCK_LABEL: Record<string, string> = {
  in_stock: "ມີສິນຄ້າ",
  low: "ເຫຼືອໜ້ອຍ",
  sold_out: "ໝົດ",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, price_lak, compare_at_price_lak, description, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return <main className="p-6">เกิดข้อผิดพลาด: {error.message}</main>;
  }

  if (!product) {
    notFound();
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, color, size, stock_status")
    .eq("product_id", product.id)
    .order("sort_order");

  const { data: settings } = await supabase
    .from("shop_settings")
    .select("whatsapp_number, messenger_username, shipping_note")
    .maybeSingle();

  const isArchived = product.status === "archived";
  const whatsapp = settings?.whatsapp_number;
  const messenger = settings?.messenger_username;
  const whatsappText = encodeURIComponent(`ສະບາຍດີ ສົນໃຈສິນຄ້າ: ${product.name}`);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm text-neutral-500">
        ← ກັບໜ້າຫຼັກ
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{product.name}</h1>

      <div className="mt-2 flex items-baseline gap-3">
        <p className="text-2xl">{formatLak(product.price_lak)}</p>
        {product.compare_at_price_lak ? (
          <p className="text-neutral-500 line-through">
            {formatLak(product.compare_at_price_lak)}
          </p>
        ) : null}
      </div>

      {product.description && (
        <p className="mt-4 whitespace-pre-line">{product.description}</p>
      )}

      {isArchived && (
        <p className="mt-4 rounded border p-3 text-neutral-500">
          ສິນຄ້ານີ້ປິດການຂາຍແລ້ວ
        </p>
      )}

      {variants && variants.length > 0 && (
        <ul className="mt-6 divide-y rounded border">
          {variants.map((variant) => (
            <li key={variant.id} className="flex justify-between p-3">
              <span>
                {[variant.color, variant.size].filter(Boolean).join(" / ") || "-"}
              </span>
              <span className="text-neutral-500">
                {STOCK_LABEL[variant.stock_status]}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!isArchived && (whatsapp || messenger) && (
        <div className="mt-6 flex flex-col gap-3">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-center"
            >
              ສັ່ງຊື້ທາງ WhatsApp
            </a>
          )}
          {messenger && (
            <a
              href={`https://m.me/${messenger}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border px-4 py-3 text-center"
            >
              ສັ່ງຊື້ທາງ Messenger
            </a>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        {settings?.shipping_note || "* ຍັງບໍ່ລວມຄ່າສົ່ງ"}
      </p>
    </main>
  );
}