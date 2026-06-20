export type GSTBreakup = {
  subtotal: number;
  cgst: number; // intra-state only
  sgst: number; // intra-state only
  igst: number; // inter-state only
  total: number;
  gstType: 'intra' | 'inter';
};
 
export function calculateGST(
  subtotal: number,
  vendorState: string,
  buyerState: string,
  gstRate = 0.18 // 18% default
): GSTBreakup {
  const isIntraState = vendorState.toLowerCase().trim() === buyerState.toLowerCase().trim();
  
  if (isIntraState) {
    const half = parseFloat((subtotal * (gstRate / 2)).toFixed(2));
    return { 
      subtotal, 
      cgst: half, 
      sgst: half, 
      igst: 0,
      total: subtotal + half + half, 
      gstType: 'intra' 
    };
  } else {
    const igst = parseFloat((subtotal * gstRate).toFixed(2));
    return { 
      subtotal, 
      cgst: 0, 
      sgst: 0, 
      igst,
      total: subtotal + igst, 
      gstType: 'inter' 
    };
  }
}
