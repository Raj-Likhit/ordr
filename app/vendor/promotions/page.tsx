import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Tag } from "lucide-react";
import { CreatePromoModal } from "./CreatePromoModal";
import { PromoStatusToggle } from "./PromoStatusToggle";

export default async function VendorPromotionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/vendor");
  }

  // Fetch promotions
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="font-display text-[var(--text-display)] text-[var(--color-text-primary)]">Promotions</h1>
          <p className="text-[var(--color-text-secondary)] font-body mt-2">
            Create and manage discount codes for your customers.
          </p>
        </div>
        <CreatePromoModal vendorId={user.id} />
      </header>

      {(!promotions || promotions.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] text-center px-4">
          <Tag size={48} className="text-[var(--color-text-muted)] mb-6" strokeWidth={1.5} />
          <h2 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)] mb-2">
            No promotions yet
          </h2>
          <p className="text-[var(--color-text-secondary)] font-body max-w-md mb-8">
            Create your first promo code to reward loyal customers or run a seasonal sale.
          </p>
          <CreatePromoModal vendorId={user.id} trigger={<Button variant="primary" className="flex items-center gap-2"><Plus size={16} /> Create Promo Code</Button>} />
        </div>
      ) : (
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[var(--text-small)] uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 font-semibold text-[var(--text-small)] uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 font-semibold text-[var(--text-small)] uppercase tracking-wider">Min. Order</th>
                <th className="px-6 py-4 font-semibold text-[var(--text-small)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-[var(--text-small)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] tracking-wide">
                    {promo.code}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {promo.min_order_value > 0 ? `₹${promo.min_order_value}` : 'None'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <PromoStatusToggle promoId={promo.id} isActive={promo.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
