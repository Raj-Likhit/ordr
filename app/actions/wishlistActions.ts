"use server";

import { createClient } from "@/lib/supabase/server";
import { WishlistRepository } from "@/src/modules/wishlists/wishlist.repository";
import { WishlistService } from "@/src/modules/wishlists/wishlist.service";
import { revalidatePath } from "next/cache";

export async function moveToSavedForLater(productId: string, cartItemId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Add to wishlist
    const service = new WishlistService(new WishlistRepository(supabase));
    
    // Check if a group exists, if not create "Saved For Later"
    const groups = await service.getGroups(user.id);
    let groupId = groups.length > 0 ? groups[0].id : null;
    
    if (!groupId) {
      const newGroup = await service.createGroup(user.id, { name: "Saved For Later" } as any);
      groupId = newGroup.id;
    }
    
    try {
      await service.addItem(user.id, { group_id: groupId, product_id: productId } as any);
    } catch (e: any) {
      // Ignore if it's already in the wishlist
      if (e.statusCode !== 400 && e.message !== "Item already in wishlist") {
        throw e;
      }
    }

    // 2. Remove from cart using the API/service
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (cartError) {
      return { success: false, error: cartError.message };
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to move to saved for later" };
  }
}
