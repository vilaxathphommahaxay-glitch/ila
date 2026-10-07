import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";


const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao", "latin"],
});

export const metadata: Metadata = {
	title: "ILa",
	description: "ຮ້ານ ILa — ສິນຄ້າຈາກຈີນ ເລືອກຊົມງ່າຍ ພ້ອມສົ່ງ",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="lo">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${notoSansLao.className} antialiased`}>{children}</body>
		</html>
	);
}
