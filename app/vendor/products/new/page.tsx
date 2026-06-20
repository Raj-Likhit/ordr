"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus, Loader2, CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Sarees","Apparel","Jewellery","Home Decor","Art","Handicrafts","Pottery","Textiles","Accessories","Food & Spices", "Tech"];

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: string;
  sku: string;
  price_override: string;
}

interface FormData {
  title: string;
  description: string;
  base_price: string;
  category_id: string;
  is_active: boolean;
}

interface FormErrors {
  title?: string;
  base_price?: string;
  category_id?: string;
  variants?: string;
}

interface ImagePreview {
  id: string;
  url: string;
  name: string;
  file: File;
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-2">
      {children}
      {required && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[var(--text-small)] text-[var(--color-error)] flex items-center gap-1"><span>⚠</span>{msg}</p>;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [form, setForm] = useState<FormData>({
    title: "", description: "", base_price: "", category_id: "", is_active: true,
  });
  
  const [variants, setVariants] = useState<Variant[]>([
    { id: crypto.randomUUID(), size: "", color: "", stock: "0", sku: "", price_override: "" }
  ]);

  const [errors, setErrors]   = useState<FormErrors>({});
  const [images, setImages]   = useState<ImagePreview[]>([]);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: crypto.randomUUID(), size: "", color: "", stock: "0", sku: "", price_override: "" }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim())         errs.title      = "Product name is required";
    if (!form.base_price || isNaN(Number(form.base_price)) || Number(form.base_price) <= 0)
                                    errs.base_price = "Enter a valid base price";
    if (!form.category_id)          errs.category_id = "Select a category";
    
    // Validate variants
    for (const v of variants) {
      if (isNaN(Number(v.stock)) || Number(v.stock) < 0 || v.stock === "") {
        errs.variants = "All variants must have a valid stock amount";
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews: ImagePreview[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .slice(0, 6 - images.length)
      .map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), name: f.name, file: f }));
    setImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    
    try {
      // 1. Upload Images
      const uploadedUrls: string[] = [];
      for (const img of images) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, img.file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Image upload error:", error);
          throw new Error("Failed to upload image");
        }
        
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      // 2. Submit Product
      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title,
          description: form.description,
          base_price:  Number(form.base_price),
          category_id: form.category_id || null,
          is_active:   form.is_active,
          variants:    variants.map(v => ({
            size: v.size || null,
            color: v.color || null,
            stock: Number(v.stock),
            sku: v.sku || null,
            price_override: v.price_override ? Number(v.price_override) : null
          })),
          images:      uploadedUrls
        }),
      });
      
      if (!res.ok) throw new Error("Failed to create product");
      
      setSuccess(true);
      setTimeout(() => router.push("/vendor/products"), 1500);
    } catch (err: any) {
      setSaving(false);
      alert(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1.5 text-[var(--text-small)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-4"
        >
          <ArrowLeft size={15} /> Back to Products
        </Link>
        <h1 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)]">Add New Product</h1>
        <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
          Fill in the details below to list a new product in your store.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#E8F3ED] border border-[var(--color-success)] rounded-[var(--radius-md)] text-[var(--color-success)]">
          <CheckCircle2 size={18} />
          <span className="text-[var(--text-small)] font-medium">Product created! Redirecting…</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">
            Basic Information
          </h2>

          <div>
            <FieldLabel htmlFor="title" required>Product Name</FieldLabel>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={e => update("title", e.target.value)}
              placeholder="e.g. Hand-woven Silk Saree in Banarasi Style"
              maxLength={120}
              className={`w-full px-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.title ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
            />
            <FieldError msg={errors.title} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="base_price" required>Base Price (INR)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-[var(--text-body)] font-medium pointer-events-none">₹</span>
                <input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={e => update("base_price", e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.base_price ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
                />
              </div>
              <FieldError msg={errors.base_price} />
            </div>

            <div>
              <FieldLabel htmlFor="category_id" required>Category</FieldLabel>
              <select
                id="category_id"
                value={form.category_id}
                onChange={e => update("category_id", e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all ${errors.category_id ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>{c}</option>
                ))}
              </select>
              <FieldError msg={errors.category_id} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              value={form.description}
              onChange={e => update("description", e.target.value)}
              placeholder="Describe your product — materials, craftsmanship, care instructions…"
              rows={5}
              className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all resize-y min-h-[120px]"
            />
          </div>
        </section>

        {/* Variants Builder */}
        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-5 shadow-[var(--shadow-sm)]">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
            <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)]">
              Product Variants (Sizes / Colors)
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-[var(--text-small)] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>
          
          <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">
            If your product has no variants, simply use the single default variant to set your stock and SKU.
          </p>
          <FieldError msg={errors.variants} />

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id} className="p-4 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] flex flex-col gap-4 relative">
                {variants.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeVariant(variant.id)}
                    className="absolute top-2 right-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor={`size-${index}`}>Size</FieldLabel>
                    <input
                      id={`size-${index}`}
                      type="text"
                      value={variant.size}
                      onChange={e => updateVariant(variant.id, "size", e.target.value)}
                      placeholder="e.g. Medium"
                      className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-body)]"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor={`color-${index}`}>Color</FieldLabel>
                    <input
                      id={`color-${index}`}
                      type="text"
                      value={variant.color}
                      onChange={e => updateVariant(variant.id, "color", e.target.value)}
                      placeholder="e.g. Red"
                      className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-body)]"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`stock-${index}`} required>Stock</FieldLabel>
                    <input
                      id={`stock-${index}`}
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={e => updateVariant(variant.id, "stock", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-body)]"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`price-${index}`}>Price Override</FieldLabel>
                    <input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price_override}
                      onChange={e => updateVariant(variant.id, "price_override", e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-body)]"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor={`sku-${index}`}>SKU</FieldLabel>
                    <input
                      id={`sku-${index}`}
                      type="text"
                      value={variant.sku}
                      onChange={e => updateVariant(variant.id, "sku", e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-body)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">
            Product Images
          </h2>
          <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">Upload up to 6 images. First image becomes the cover.</p>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
            aria-label="Upload product images"
            className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-surface)]"
            }`}
          >
            <ImagePlus size={32} className={`mx-auto mb-3 ${dragOver ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`} />
            <p className="text-[var(--text-small)] font-medium text-[var(--color-text-secondary)]">
              Drag & drop images here, or <span className="text-[var(--color-accent)]">click to browse</span>
            </p>
            <p className="text-[var(--text-label)] text-[var(--color-text-muted)] mt-1">PNG, JPG, WEBP — max 5MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleImageFiles(e.target.files)}
              className="sr-only"
              aria-hidden="true"
            />
          </div>

          {/* Preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group aspect-square rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-accent)] py-0.5 text-center">
                      <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Cover</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 p-0.5 bg-[var(--color-bg-dark)] bg-opacity-70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-error)]"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add more images"
                  className="aspect-square rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-surface)] transition-all duration-200"
                >
                  <Plus size={20} className="text-[var(--color-text-muted)]" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Visibility toggle */}
        <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)]">Listing Status</h2>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-0.5">
                {form.is_active ? "Product will be visible to buyers immediately." : "Product saved as draft — not visible to buyers."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => update("is_active", !form.is_active)}
              className={`relative w-12 h-6 rounded-[var(--radius-full)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${form.is_active ? "bg-[var(--color-success)]" : "bg-[var(--color-border-strong)]"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[var(--shadow-sm)] transition-transform duration-200 ${form.is_active ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </button>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor/products"
            className="w-full sm:w-auto px-6 py-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || success}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] font-body text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] hover:-translate-y-[1px] transition-all duration-200 shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading & Saving…</>
            ) : success ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              <>
                <Plus size={16} /> Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
