import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/src/common/errors/AppError";
import { IWishlistRepository } from "./wishlist.interface";

export class WishlistRepository implements IWishlistRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createGroup(userId: string, name: string) {
    const { data, error } = await this.supabase
      .from("wishlist_groups")
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create wishlist group: ${error.message}`, 500);
    }
    return data;
  }

  async getGroups(userId: string) {
    const { data, error } = await this.supabase
      .from("wishlist_groups")
      .select(`
        *,
        items:wishlist_items (
          id,
          product_id,
          added_at,
          product:products (*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch wishlist groups: ${error.message}`, 500);
    }
    return data || [];
  }

  async deleteGroup(groupId: string, userId: string) {
    const { error } = await this.supabase
      .from("wishlist_groups")
      .delete()
      .eq("id", groupId)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(`Failed to delete group: ${error.message}`, 500);
    }
  }

  async addItem(groupId: string, productId: string) {
    const { data, error } = await this.supabase
      .from("wishlist_items")
      .insert({ group_id: groupId, product_id: productId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new AppError("Item already in wishlist", 400);
      }
      throw new AppError(`Failed to add item to wishlist: ${error.message}`, 500);
    }
    return data;
  }

  async removeItem(itemId: string) {
    const { error } = await this.supabase
      .from("wishlist_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      throw new AppError(`Failed to remove item: ${error.message}`, 500);
    }
  }
}
