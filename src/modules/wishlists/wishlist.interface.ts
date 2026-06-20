export interface WishlistGroup {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  group_id: string;
  product_id: string;
  added_at: string;
  product?: any;
}

export interface IWishlistRepository {
  createGroup(userId: string, name: string): Promise<WishlistGroup>;
  getGroups(userId: string): Promise<WishlistGroup[]>;
  deleteGroup(groupId: string, userId: string): Promise<void>;
  addItem(groupId: string, productId: string): Promise<WishlistItem>;
  removeItem(itemId: string): Promise<void>;
}
