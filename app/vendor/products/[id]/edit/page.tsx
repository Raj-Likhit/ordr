"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, Save, ImagePlus, X, Plus, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Sarees","Apparel","Jewellery","Home Decor","Art","Handicrafts","Pottery","Textiles","Accessories","Food and Spices", "Tech"];

interface ProductData {
  id: string;
  title: string;
  description: string;
  base_price: number;
  category_id: string;
  stock: number;
  sku: string;
  is_active: boolean;
}

interface FormErrors { title?: string; base_price?: string; category_id?: string; }
interface ImagePreview { id: string; url: string; name: string; }



function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-2">
      {children}{required && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[var(--text-small)] text-[var(--color-error)]">{msg}</p>;
}

export default function EditProductPage() {
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form,     setForm]     = useState<Partial<ProductData>>({});
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [images,   setImages]   = useState<ImagePreview[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setForm(data);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  const update = (field: keyof ProductData, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title?.trim())          errs.title      = "Product name is required";
    if (!form.base_price || Number(form.base_price) <= 0) errs.base_price = "Enter a valid price";
    if (!form.category_id)            errs.category_id = "Select a category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews: ImagePreview[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .slice(0, 6 - images.length)
      .map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), name: f.name }));
    setImages(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vendor/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, base_price: Number(form.base_price), category_id: form.category_id, stock: Number(form.stock), sku: form.sku, is_active: form.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess(true);
      setTimeout(() => router.push("/vendor/products"), 1500);
    } catch {
      setSaving(false);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-48 w-full rounded-[var(--radius-lg)]" />
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <AlertTriangle size={48} className="mx-auto text-[var(--color-warning)] mb-4" />
        <h1 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)] mb-2">Product Not Found</h1>
        <p className="text-[var(--color-text-muted)] mb-6">This product does not exist or does not belong to your store.</p>
        <Link href="/vendor/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] transition-all">
          <ArrowLeft size={15} /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/vendor/products" className="inline-flex items-center gap-1.5 text-[var(--text-small)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-4">
          <ArrowLeft size={15} /> Back to Products
        </Link>
        <h1 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)]">Edit Product</h1>
        <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
          Update product details. Changes appear on the storefront immediately when active.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#E8F3ED] border border-[var(--color-success)] rounded-[var(--radius-md)] text-[var(--color-success)]">
          <CheckCircle2 size={18} />
          <span className="text-[var(--text-small)] font-medium">Product updated! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">Basic Information</h2>
          <div>
            <FieldLabel htmlFor="title" required>Product Name</FieldLabel>
            <input id="title" type="text" value={form.title ?? ""} maxLength={120} onChange={e => update("title", e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.title ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
            />
            <FieldError msg={errors.title} />
          </div>
          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea id="description" rows={5} value={form.description ?? ""} onChange={e => update("description", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all resize-y min-h-[120px]"
            />
          </div>
        </section>

        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">Pricing and Inventory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="base_price" required>Price (INR)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none font-medium">Rs.</span>
                <input id="base_price" type="number" min="0" step="0.01" value={form.base_price ?? ""} onChange={e => update("base_price", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.base_price ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
                />
              </div>
              <FieldError msg={errors.base_price} />
            </div>
            <div>
              <FieldLabel htmlFor="stock">Stock Quantity</FieldLabel>
              <input id="stock" type="number" min="0" value={form.stock ?? 0} onChange={e => update("stock", Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all"
              />
            </div>
            <div>
              <FieldLabel htmlFor="category_id" required>Category</FieldLabel>
              <select id="category_id" value={form.category_id ?? ""} onChange={e => update("category_id", e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.category_id ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>{c}</option>)}
              </select>
              <FieldError msg={errors.category_id} />
            </div>
            <div>
              <FieldLabel htmlFor="sku">SKU (optional)</FieldLabel>
              <input id="sku" type="text" value={form.sku ?? ""} onChange={e => update("sku", e.target.value)} placeholder="e.g. ART-SLK-BAN-001"
                className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">Product Images</h2>
          <div
            role="button" tabIndex={0}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
            aria-label="Upload product images"
            className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]" : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"}`}
          >
            <ImagePlus size={28} className={`mx-auto mb-3 ${dragOver ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`} />
            <p className="text-[var(--text-small)] font-medium text-[var(--color-text-secondary)]">Drag and drop or <span className="text-[var(--color-accent)]">click to browse</span></p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleImageFiles(e.target.files)} className="sr-only" aria-hidden />
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group aspect-square rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-accent)] py-0.5 text-center"><span className="text-[10px] text-white font-semibold uppercase">Cover</span></div>}
                  <button type="button" onClick={() => setImages(p => p.filter(i => i.id !== img.id))} aria-label="Remove" className="absolute top-1 right-1 p-0.5 bg-black bg-opacity-60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ))}
              {images.length < 6 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] transition-all">
                  <Plus size={20} className="text-[var(--color-text-muted)]" />
                </button>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)]">Listing Status</h2>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-0.5">{form.is_active ? "Visible to buyers on the storefront." : "Saved as draft."}</p>
            </div>
            <button type="button" role="switch" aria-checked={form.is_active} onClick={() => update("is_active", !form.is_active)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${form.is_active ? "bg-[var(--color-success)]" : "bg-[var(--color-border-strong)]"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_active ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link href="/vendor/products" className="w-full sm:w-auto px-6 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all text-center">
            Cancel
          </Link>
          <button type="submit" disabled={saving || success}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> :
             success ? <><CheckCircle2 size={16} /> Saved!</> :
             <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}