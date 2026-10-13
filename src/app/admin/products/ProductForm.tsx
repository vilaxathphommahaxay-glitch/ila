"use client";

// ฟอร์มสินค้า ใช้ทั้งหน้าเพิ่มและหน้าแก้ไข
// เป็น client component เพราะใช้ useActionState: เมื่อ Server Action ตอบ error กลับมา
// เราเอาค่าที่กรอกไว้ใส่กลับเข้าช่อง (ไม่ให้พิมพ์ใหม่ทั้งหมด)
import { useActionState } from "react";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABEL,
  type FormValues,
  type ProductFormState,
} from "../../../lib/product-form";

type Props = {
  mode: "create" | "edit";
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  initialValues: FormValues;
  categories: { id: number; name: string }[];
};

const fieldClass = "w-full rounded-lg border bg-transparent p-2";

export default function ProductForm({
  mode,
  action,
  initialValues,
  categories,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
  });
  const v = state.values;

  return (
    // noValidate: ให้เซิร์ฟเวอร์เป็นผู้ตรวจและแสดงข้อความภาษาลาวเอง (ไม่ใช้ข้อความของเบราว์เซอร์)
    <form action={formAction} noValidate className="space-y-4">
      {state.error && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-sm text-green-500">
          ບັນທຶກແລ້ວ
        </p>
      )}

      {mode === "create" ? (
        <label className="block">
          <span className="mb-1 block text-sm">SKU</span>
          <input
            name="sku"
            defaultValue={v.sku}
            autoComplete="off"
            placeholder="TEE-001"
            className={fieldClass}
          />
          <span className="mt-1 block text-xs text-neutral-500">
            ຕັ້ງໄດ້ຄັ້ງດຽວ ແກ້ພາຍຫຼັງບໍ່ໄດ້ (ໃຊ້ສ້າງລິ້ງຂອງສິນຄ້າ)
          </span>
        </label>
      ) : (
        <p className="text-sm text-neutral-500">SKU: {initialValues.sku}</p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm">ຊື່ສິນຄ້າ</span>
        <input
          name="name"
          defaultValue={v.name}
          autoComplete="off"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm">ໝວດ</span>
        {/* key: ฟอร์มถูก reset หลัง action เสร็จ แต่ <select> ไม่รับ defaultValue ใหม่เอง
            จึงใช้ key ให้สร้างใหม่ทุกครั้งที่ค่าเปลี่ยน (ไม่งั้นตัวเลือกจะเด้งกลับเป็นค่าแรก) */}
        <select
          key={v.categoryId}
          name="categoryId"
          defaultValue={v.categoryId}
          className={fieldClass}
        >
          <option value="">— ເລືອກໝວດ —</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm">ລາຄາ (₭)</span>
          <input
            name="priceLak"
            defaultValue={v.priceLak}
            inputMode="numeric"
            autoComplete="off"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">ລາຄາກ່ອນຫຼຸດ (ບໍ່ບັງຄັບ)</span>
          <input
            name="compareAtPriceLak"
            defaultValue={v.compareAtPriceLak}
            inputMode="numeric"
            autoComplete="off"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm">ລາຍລະອຽດ</span>
        <textarea
          name="description"
          defaultValue={v.description}
          rows={6}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm">ສະຖານະ</span>
        <select
          key={v.status}
          name="status"
          defaultValue={v.status}
          className={fieldClass}
        >
          {PRODUCT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PRODUCT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border px-4 py-2 font-medium disabled:opacity-50"
      >
        {mode === "create" ? "ສ້າງສິນຄ້າ" : "ບັນທຶກ"}
      </button>
    </form>
  );
}
