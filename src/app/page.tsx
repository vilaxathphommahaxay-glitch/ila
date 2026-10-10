import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");

  if (error) {
    return <main className="p-6">เกิดข้อผิดพลาด: {error.message}</main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-5xl font-bold">ILa</h1>
      <p className="text-xl">ຍິນດີຕ້ອນຮັບສູ່ຮ້ານ ILa</p>
      <p className="text-neutral-500">ສິນຄ້າຈາກຈີນ ພ້ອມສົ່ງ — ກຳລັງຈະມາໃນໄວໆນີ້</p>
      <ul className="flex flex-wrap justify-center gap-3">
        {data.map((category) => (
          <li key={category.id} className="rounded-full border px-4 py-2">
            {category.name}
          </li>
        ))}
      </ul>
    </main>
  );
}