import Link from "next/link";
import { formatLak } from "../lib/format";
import { productImageUrl } from "../lib/storage";

type ProductCardProps = {
  slug: string;
  name: string;
  priceLak: number;
  coverPath?: string;
};

export default function ProductCard({
  slug,
  name,
  priceLak,
  coverPath,
}: ProductCardProps) {
  return (
    <Link href={`/p/${slug}`} className="block overflow-hidden rounded-lg border">
      {coverPath ? (
        <img
          src={productImageUrl(coverPath)}
          alt={name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="aspect-square w-full bg-neutral-800" />
      )}
      <div className="p-4">
        <p className="font-medium">{name}</p>
        <p className="text-neutral-500">{formatLak(priceLak)}</p>
      </div>
    </Link>
  );
}