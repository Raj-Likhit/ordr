"use server";

import { createClient } from "@/lib/supabase/server";
import { WishlistRepository } from "@/src/modules/wishlists/wishlist.repository";
import { WishlistService } from "@/src/modules/wishlists/wishlist.service";
import { CartRepository } from "@/src/modules/cart/cart.repository";
import { CartService } from "@/src/modules/cart/cart.service";
import { revalidatePath } from "next/cache";
import { z } from 'zod';

const MoveToSavedDto = z.object({
  productId: z.string().uuid(),
  cartItemId: z.string().uuid(),
});

export async function moveToSavedForLater(productId: string, cartItemId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validation Layer (DTO)
    const parseResult = MoveToSavedDto.safeParse({ productId, cartItemId });
    if (!parseResult.success) {
      return { success: false, error: "Invalid product or cart item." };
    }

    // Application Service Layer
    const wishlistService = new WishlistService(new WishlistRepository(supabase));
    const cartService = new CartService(new CartRepository());
    
    // 1. Add to wishlist
    const groups = await wishlistService.getGroups(user.id);
    let groupId = groups.length > 0 ? groups[0].id : null;
    
    if (!groupId) {
      const newGroup = await wishlistService.createGroup(user.id, { name: "Saved For Later" } as any);
      groupId = newGroup.id;
    }
    
    try {
      await wishlistService.addItem(user.id, { group_id: groupId, product_id: parseResult.data.productId } as any);
    } catch (e: any) {
      // Ignore if it's already in the wishlist
      if (e.statusCode !== 400 && e.message !== "Item already in wishlist") {
        throw e;
      }
    }

    // 2. Remove from cart using the Cart Service (No cross-domain raw queries)
    await cartService.removeCartItem(parseResult.data.cartItemId);

    // Presentation Layer (HTTP / Revalidation)
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to move to saved for later" };
  }
}

