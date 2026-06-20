import { CreateWishlistGroupDTO, AddWishlistItemDTO, createWishlistGroupSchema, addWishlistItemSchema } from "./wishlist.dto";
import { AppError } from "@/src/common/errors/AppError";
import { IWishlistRepository } from "./wishlist.interface";

export class WishlistService {
  constructor(private readonly repository: IWishlistRepository) {}

  async createGroup(userId: string, data: CreateWishlistGroupDTO) {
    const validated = createWishlistGroupSchema.safeParse(data);
    if (!validated.success) {
      throw new AppError("Invalid input data", 400);
    }
    return this.repository.createGroup(userId, validated.data.name);
  }

  async getGroups(userId: string) {
    return this.repository.getGroups(userId);
  }

  async deleteGroup(userId: string, groupId: string) {
    await this.repository.deleteGroup(groupId, userId);
  }

  async addItem(userId: string, data: AddWishlistItemDTO) {
    const validated = addWishlistItemSchema.safeParse(data);
    if (!validated.success) {
      throw new AppError("Invalid input data", 400);
    }
    
    // Check if the group belongs to the user
    const groups = await this.repository.getGroups(userId);
    const group = groups.find(g => g.id === validated.data.group_id);
    if (!group) {
      throw new AppError("Wishlist group not found or access denied", 404);
    }

    return this.repository.addItem(validated.data.group_id, validated.data.product_id);
  }

  async removeItem(userId: string, itemId: string) {
    // We could do a strict check that the item belongs to the user's group,
    // but RLS on the DB level handles this since delete requires access to the row via policies.
    await this.repository.removeItem(itemId);
  }
}
