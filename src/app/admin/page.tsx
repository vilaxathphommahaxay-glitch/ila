import { requireAdmin } from "../../lib/admin";
import { signOut } from "./actions";

export default async function AdminHomePage() {
  const { email } = await requireAdmin();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">ແຜງຜູ້ດູແລຮ້ານ ILa</h1>
      <p className="mt-2 text-neutral-500">ເຂົ້າສູ່ລະບົບເປັນ: {email}</p>

      <form action={signOut} className="mt-6">
        <button type="submit" className="rounded-lg border px-4 py-2">
          ອອກຈາກລະບົບ
        </button>
      </form>
    </main>
  );
}
