import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Server Action to toggle suspension
async function toggleListing(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const productId = formData.get('productId') as string;
  const action = formData.get('action') as string; // 'suspend' | 'reinstate'
  
  const isActive = action === 'reinstate';

  await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  redirect('/admin/products');
}

export default async function AdminProductsPage() {
  const supabase = createClient();
  
  // Fetch products with vendor info
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      base_price,
      is_active,
      created_at,
      vendor_profiles (
        business_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Products Directory</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Manage all vendor listings across the platform.</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(!products || products.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={product.title}>
                        {product.title}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(product.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.vendor_profiles?.business_name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.base_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={toggleListing} className="inline-block">
                        <input type="hidden" name="productId" value={product.id} />
                        {product.is_active ? (
                          <Button type="submit" name="action" value="suspend" variant="secondary" size="sm" className="text-red-600 border border-red-200 hover:bg-red-50 flex items-center gap-1 h-8">
                            <AlertTriangle size={14} /> Suspend
                          </Button>
                        ) : (
                          <Button type="submit" name="action" value="reinstate" variant="secondary" size="sm" className="text-green-600 border border-green-200 hover:bg-green-50 flex items-center gap-1 h-8">
                            <CheckCircle2 size={14} /> Reinstate
                          </Button>
                        )}
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
