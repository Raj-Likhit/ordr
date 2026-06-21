"use server";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createClient } from '@/lib/supabase/server';
import { calculateGST } from '@/lib/utils/gstCalculator';

export async function generateInvoice(subOrderId: string) {
  const supabase = createClient();

  // 1. Fetch full order with buyer + vendor profiles
  const { data: subOrder, error } = await supabase
    .from('sub_orders')
    .select(`
      *,
      order:orders (
        buyer_id,
        address:user_addresses ( line1:address_line1, line2:address_line2, city, state, pincode ),
        buyer:profiles!orders_buyer_id_fkey ( full_name, email )
      ),
      vendor:vendor_profiles ( id, business_name, store_address )
    `)
    .eq('id', subOrderId)
    .single();

  if (error || !subOrder) throw new Error('Order not found');

  // Fetch line items
  const { data: items } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_time,
      variant:product_variants (
        size,
        product:products ( title, category_id )
      )
    `)
    .eq('sub_order_id', subOrderId);

  // Generate Invoice Number (Mocked sequence or timestamp for now to avoid custom SQL functions)
  const invoiceNumber = `INV-${new Date().getFullYear()}-${subOrderId.split('-')[0].toUpperCase()}`;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TAX INVOICE', margin, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoiceNumber}`, pageW - margin, 30, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - margin, 46, { align: 'right' });
  doc.text(`Order ID: ${subOrderId.slice(0,8).toUpperCase()}`, pageW - margin, 62, { align: 'right' });

  // ── Vendor & Buyer Details ───────────────────────────────
  let y = 90;
  doc.setTextColor(30, 58, 95); 
  doc.setFont('helvetica', 'bold'); 
  doc.setFontSize(10);
  doc.text('SOLD BY', margin, y);
  doc.text('BILLED TO', pageW / 2, y);

  doc.setFont('helvetica', 'normal'); 
  doc.setTextColor(50, 50, 50); 
  y += 14;

  const v: any = Array.isArray(subOrder.vendor) ? subOrder.vendor[0] : subOrder.vendor;
  const o: any = Array.isArray(subOrder.order) ? subOrder.order[0] : subOrder.order;
  const b: any = Array.isArray(o?.buyer) ? o.buyer[0] : o?.buyer;
  const a: any = Array.isArray(o?.address) ? o.address[0] : o?.address;

  // Assuming vendor stores address as JSON string or text, fallback to empty
  const vendorAddressText = typeof v?.store_address === 'string' ? v.store_address : "Vendor Address on file";
  const buyerAddressText = a ? `${a.line1}, ${a.city}, ${a.state} ${a.pincode}` : "Buyer Address on file";

  doc.text([
    v?.business_name || 'Vendor', 
    'Email on file', 
    'GSTIN: PENDING', 
    vendorAddressText
  ], margin, y);

  doc.text([
    b?.full_name || 'Customer', 
    b?.email || '', 
    buyerAddressText
  ], pageW / 2, y);

  // ── Line Items Table ─────────────────────────────────────
  y += 70;
  
  const mappedItems = items?.map((item: any, i: number) => {
    const variant: any = Array.isArray(item.variant) ? item.variant[0] : item.variant;
    const product: any = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
    return [
      i + 1,
      `${product?.title || 'Item'} ${variant?.size ? `(${variant.size})` : ''}`,
      '—', // HSN
      item.quantity,
      `Rs. ${Number(item.price_at_time).toFixed(2)}`,
      `Rs. ${(item.quantity * item.price_at_time).toFixed(2)}`
    ];
  }) || [];

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'HSN/SAC', 'Qty', 'Unit Price', 'Amount']],
    body: mappedItems,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 5: { halign: 'right' } }
  });

  // ── Tax Summary ──────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Calculate GST
  const buyerState = a?.state || '';
  const vendorState = ''; // We don't have vendor state explicitly in schema, assuming Intra-state by default for demo
  const tax = calculateGST(Number(subOrder.subtotal), vendorState, buyerState);

  const taxRows: any[] = [
    ['Subtotal', `Rs. ${tax.subtotal.toFixed(2)}`],
  ];

  if (tax.cgst > 0) taxRows.push(['CGST (9%)', `Rs. ${tax.cgst.toFixed(2)}`]);
  if (tax.sgst > 0) taxRows.push(['SGST (9%)', `Rs. ${tax.sgst.toFixed(2)}`]);
  if (tax.igst > 0) taxRows.push(['IGST (18%)', `Rs. ${tax.igst.toFixed(2)}`]);
  
  taxRows.push(['TOTAL', `Rs. ${tax.total.toFixed(2)}`]);

  autoTable(doc, {
    startY: finalY, 
    body: taxRows, 
    theme: 'plain',
    styles: { fontSize: 9, halign: 'right' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 380 }, 1: { cellWidth: 100 } },
    didDrawCell: (data) => {
      if (data.row.index === taxRows.length - 1) {
        doc.setDrawColor(30, 58, 95); 
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
      }
    }
  });

  // ── Footer ───────────────────────────────────────────────
  doc.setFontSize(8); 
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated invoice and does not require a signature.',
    pageW / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

  // ── Upload to Supabase Storage ───────────────────────────
  const pdfBytes = doc.output('arraybuffer');
  const storagePath = `invoices/${subOrderId}.pdf`;
  
  const { error: uploadErr } = await supabase.storage
    .from('order-invoices')
    .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: true });
    
  if (uploadErr) {
    console.error("Invoice Upload Error:", uploadErr);
    throw uploadErr;
  }

  // ── Record in invoices table ─────────────────────────────
  await supabase.from('invoices').upsert({
    sub_order_id: subOrderId,
    pdf_url: storagePath
  }, { onConflict: 'sub_order_id' });

  return { invoiceNumber, storagePath };
}
