import type { Metadata } from "next";

import { WishlistGrid } from "@/components/account/wishlist-grid";
import { requireUser } from "@/lib/auth/guards";
import { getWishlistHotels } from "@/lib/wishlist/queries";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false },
};

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");
  const hotels = await getWishlistHotels(user.id);

  return (
    <div className="grid gap-2">
      <h1 className="type-title-lg">Wishlist</h1>
      <WishlistGrid initialHotels={hotels} />
    </div>
  );
}
