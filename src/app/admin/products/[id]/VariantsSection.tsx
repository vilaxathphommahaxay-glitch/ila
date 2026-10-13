// ส่วน "ตัวเลือก (สี / ไซซ์)" ของหน้าแก้ไขสินค้า
// เป็น Server Component ล้วน: แต่ละปุ่มคือฟอร์ม HTML ธรรมดาที่เรียก Server Action
// (ไม่ต้องใช้ JavaScript ฝั่งเบราว์เซอร์ — กดปุ่มแล้วเปลี่ยนสถานะสต็อกได้ทันที)
import {
  STOCK_LABEL,
  STOCK_STATUSES,
  VARIANT_ERRORS,
  type VariantErrorCode,
  type VariantRow,
} from "../../../../lib/variant-form";
import { addVariant, deleteVariant, setVariantStock } from "../variant-actions";

const inputClass = "w-full rounded-lg border bg-transparent p-2";

export default function VariantsSection({
  productId,
  variants,
  errorCode,
}: {
  productId: number;
  variants: VariantRow[];
  errorCode?: VariantErrorCode;
}) {
  return (
    <section id="variants" className="mt-10">
      <h2 className="text-lg font-semibold">ຕົວເລືອກ (ສີ / ໄຊສ໌)</h2>

      {variants.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">ຍັງບໍ່ມີຕົວເລືອກ</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-500/30">
          {variants.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="min-w-24 font-medium">
                {[v.color, v.size].filter(Boolean).join(" · ")}
              </span>

              {/* สามปุ่มในฟอร์มเดียว: กดปุ่มไหน ค่าของปุ่มนั้นถูกส่งไปเป็น stockStatus */}
              <form
                action={setVariantStock.bind(null, productId, v.id)}
                className="flex gap-2"
              >
                {STOCK_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="submit"
                    name="stockStatus"
                    value={s}
                    disabled={s === v.stock_status}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      s === v.stock_status
                        ? "font-semibold underline"
                        : "text-neutral-500"
                    }`}
                  >
                    {STOCK_LABEL[s]}
                  </button>
                ))}
              </form>

              <form
                action={deleteVariant.bind(null, productId, v.id)}
                className="ml-auto"
              >
                <button type="submit" className="text-sm text-red-500 underline">
                  ລຶບ
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* ข้อความ error วางเหนือฟอร์มเพิ่ม: คนที่เพิ่งกดปุ่มเพิ่มอยู่ตรงนั้นพอดี จึงเห็นทันที */}
      {errorCode && (
        <p id="variant-error" role="alert" className="mt-6 text-sm text-red-500">
          {VARIANT_ERRORS[errorCode]}
        </p>
      )}

      <form
        action={addVariant.bind(null, productId)}
        className={`${errorCode ? "mt-2" : "mt-6"} grid grid-cols-2 gap-3 sm:grid-cols-4`}
      >
        <input
          name="color"
          aria-label="ສີ"
          placeholder="ສີ"
          autoComplete="off"
          className={inputClass}
        />
        <input
          name="size"
          aria-label="ໄຊສ໌"
          placeholder="ໄຊສ໌"
          autoComplete="off"
          className={inputClass}
        />
        <select
          name="stockStatus"
          aria-label="ສະຖານະສິນຄ້າ"
          defaultValue="in_stock"
          className={inputClass}
        >
          {STOCK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STOCK_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border px-4 py-2 font-medium">
          ເພີ່ມຕົວເລືອກ
        </button>
      </form>
    </section>
  );
}
