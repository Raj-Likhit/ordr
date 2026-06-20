import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WishlistRepository } from "@/src/modules/wishlists/wishlist.repository";
import { WishlistService } from "@/src/modules/wishlists/wishlist.service";
import { AppError } from "@/src/common/errors/AppError";
import { addWishlistItemSchema } from "@/src/modules/wishlists/wishlist.dto";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = addWishlistItemSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const service = new WishlistService(new WishlistRepository(supabase));
    const item = await service.addItem(user.id, result.data);
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
