import { signIn } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-xl font-semibold">ເຂົ້າສູ່ລະບົບຜູ້ດູແລ</h1>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ
        </p>
      )}

      <form action={signIn} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm">ອີເມວ</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="w-full rounded-lg border bg-transparent p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">ລະຫັດຜ່ານ</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border bg-transparent p-2"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg border px-4 py-2 font-medium"
        >
          ເຂົ້າສູ່ລະບົບ
        </button>
      </form>
    </main>
  );
}
