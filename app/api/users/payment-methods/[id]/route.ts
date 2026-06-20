import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/src/modules/users/user.repository";
import { UserService } from "@/src/modules/users/user.service";
import { AppError } from "@/src/common/errors/AppError";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const service = new UserService(new UserRepository(supabase));
    await service.deletePaymentMethod(user.id, id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
