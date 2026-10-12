import type { Metadata } from "next";

// ส่วนแอดมินทั้งหมด: บอก Google ไม่ให้เก็บหน้าเหล่านี้
// (ไม่ตรวจสิทธิ์ที่ layout — การตรวจอยู่ใน requireAdmin() ของแต่ละหน้า)
export const metadata: Metadata = {
  title: "ILa Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
