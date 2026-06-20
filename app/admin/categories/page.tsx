import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { revalidatePath } from 'next/cache';

// Server Actions
async function createCategory(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const parent_id = formData.get('parent_id') as string;
  const commission_rate = formData.get('commission_rate') as string;

  if (!name || !slug) return;

  await supabase.from('categories').insert({
    name,
    slug,
    parent_id: parent_id || null,
    commission_rate: commission_rate ? parseFloat(commission_rate) : 10.0
  });

  revalidatePath('/admin/categories');
}

async function deleteCategory(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const id = formData.get('id') as string;
  if (!id) return;

  await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/admin/categories');
}

export default async function CategoryManagerPage() {
  const supabase = createClient();
  
  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const cats = categories || [];
  
  // Build tree
  const roots = cats.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => cats.filter(c => c.parent_id === parentId);

  const renderNode = (node: any, depth = 0) => {
    const children = getChildren(node.id);
    return (
      <div key={node.id} className="mb-2">
        <div 
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          style={{ marginLeft: `${depth * 2}rem` }}
        >
          <div>
            <p className="font-medium text-sm text-gray-900">{node.name}</p>
            <p className="text-xs text-gray-500">/{node.slug} — Comm: {node.commission_rate}%</p>
          </div>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={node.id} />
            <button type="submit" className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded" title="Delete Category">
              <Trash2 size={16} />
            </button>
          </form>
        </div>
        {children.length > 0 && (
          <div className="mt-2">
            {children.map(c => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Category Management</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Create, nest, and organize product categories.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Category Tree</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            {roots.length === 0 ? (
              <p className="text-sm text-gray-500">No categories found.</p>
            ) : (
              roots.map(root => renderNode(root, 0))
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Add Category</h2>
            <form action={createCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" name="name" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border" placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input required type="text" name="slug" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border" placeholder="e.g. electronics" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
                <input required type="number" step="0.1" name="commission_rate" defaultValue="10" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select name="parent_id" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border bg-white">
                  <option value="">None (Top Level)</option>
                  {cats.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full flex items-center justify-center gap-2">
                <PlusCircle size={16} /> Create Category
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
