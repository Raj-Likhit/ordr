import * as React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Ordr Order Confirmation Email — React Email template
// ─────────────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  variant?: string;      // e.g. "Blue / L"
  quantity: number;
  unitPrice: number;
  gstAmount: number;
}

interface SubOrder {
  vendorName: string;
  items: OrderItem[];
  subtotal: number;
}

export interface OrderConfirmationProps {
  buyerName: string;
  buyerEmail: string;
  orderId: string;
  orderDate: string;        // human-readable, e.g. "18 Jun 2026"
  paymentId?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subOrders: SubOrder[];
  totalAmount: number;
  orderUrl: string;         // deep-link to /account/orders/:id
}

// ── Shared colour tokens (mirrors globals.css) ────────────────────────────────
const c = {
  bg:          '#FDFAF5',
  bgSurface:   '#F2EDE4',
  bgDark:      '#1C1917',
  accent:      '#C84B0F',
  accentSubtle:'#F5E6DC',
  textPrimary: '#1C1917',
  textSecondary:'#6B6259',
  textMuted:   '#9C9289',
  textInverse: '#FDFAF5',
  border:      '#E0D9CF',
  success:     '#2E6B4F',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

// ── Component ─────────────────────────────────────────────────────────────────
export default function OrderConfirmation({
  buyerName,
  orderId,
  orderDate,
  paymentId,
  shippingAddress,
  subOrders,
  totalAmount,
  orderUrl,
}: OrderConfirmationProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmed — Ordr</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${c.bg}; font-family: 'DM Sans', Arial, sans-serif; color: ${c.textPrimary}; -webkit-font-smoothing: antialiased; }
          a { color: ${c.accent}; text-decoration: none; }
          a:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body style={{ background: c.bg, padding: '32px 16px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: 640, margin: '0 auto' }}>
          <tbody>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <tr>
              <td>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    background: c.bgDark,
                    borderRadius: '12px 12px 0 0',
                    padding: '40px 48px',
                  }}
                >
                  <tbody>
                    <tr>
                      <td align="center">
                        {/* Logo wordmark */}
                        <p
                          style={{
                            fontFamily: 'Cormorant, Georgia, serif',
                            fontSize: 36,
                            fontWeight: 700,
                            color: c.textInverse,
                            letterSpacing: '0.05em',
                            margin: 0,
                          }}
                        >
                          ORDR
                        </p>
                        <p
                          style={{
                            fontFamily: 'DM Sans, Arial, sans-serif',
                            fontSize: 12,
                            color: '#9C9289',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginTop: 4,
                          }}
                        >
                          Artisanal Marketplace
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Success Banner ───────────────────────────────────────────── */}
            <tr>
              <td>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    background: c.accent,
                    padding: '28px 48px',
                    textAlign: 'center',
                  }}
                >
                  <tbody>
                    <tr>
                      <td align="center">
                        {/* Checkmark circle */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.20)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                            fontSize: 24,
                            lineHeight: '48px',
                          }}
                        >
                          ✓
                        </div>
                        <h1
                          style={{
                            fontFamily: 'Cormorant, Georgia, serif',
                            fontSize: 28,
                            fontWeight: 600,
                            color: '#fff',
                            margin: 0,
                          }}
                        >
                          Order Confirmed
                        </h1>
                        <p
                          style={{
                            fontFamily: 'DM Sans, Arial, sans-serif',
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.85)',
                            marginTop: 8,
                          }}
                        >
                          Thank you, {buyerName}! Your order has been placed successfully.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Order Meta ───────────────────────────────────────────────── */}
            <tr>
              <td style={{ background: c.bgSurface, padding: '32px 48px' }}>
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', paddingRight: 16 }}>
                        <p style={{ fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Order ID</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: c.textPrimary }}>#{shortId}</p>
                      </td>
                      <td style={{ width: '50%', paddingLeft: 16 }}>
                        <p style={{ fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Date</p>
                        <p style={{ fontSize: 16, fontWeight: 500, color: c.textPrimary }}>{orderDate}</p>
                      </td>
                    </tr>
                    {paymentId && (
                      <tr>
                        <td colSpan={2} style={{ paddingTop: 16 }}>
                          <p style={{ fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Payment Reference</p>
                          <p style={{ fontSize: 14, color: c.textSecondary, fontFamily: 'monospace' }}>{paymentId}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <tr>
              <td style={{ background: c.bgSurface, padding: '0 48px' }}>
                <hr style={{ border: 'none', borderTop: `1px solid ${c.border}`, margin: 0 }} />
              </td>
            </tr>

            {/* ── Sub-Orders (grouped by vendor) ───────────────────────────── */}
            {subOrders.map((so, soIdx) => (
              <React.Fragment key={soIdx}>
                <tr>
                  <td style={{ background: c.bgSurface, padding: soIdx === 0 ? '24px 48px 0' : '16px 48px 0' }}>
                    {/* Vendor header */}
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style={{
                                fontSize: 11,
                                color: c.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                marginBottom: 2,
                              }}
                            >
                              Sold by
                            </p>
                            <p
                              style={{
                                fontFamily: 'Cormorant, Georgia, serif',
                                fontSize: 18,
                                fontWeight: 600,
                                color: c.textPrimary,
                              }}
                            >
                              {so.vendorName}
                            </p>
                          </td>
                          <td align="right">
                            <span
                              style={{
                                display: 'inline-block',
                                background: c.accentSubtle,
                                color: c.accent,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                padding: '4px 10px',
                                borderRadius: 4,
                              }}
                            >
                              Placed
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Line items */}
                {so.items.map((item, iIdx) => (
                  <tr key={iIdx}>
                    <td style={{ background: c.bgSurface, padding: '12px 48px 0' }}>
                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td style={{ paddingRight: 16 }}>
                              <p style={{ fontSize: 14, fontWeight: 500, color: c.textPrimary, marginBottom: 2 }}>
                                {item.name}
                              </p>
                              {item.variant && (
                                <p style={{ fontSize: 12, color: c.textMuted }}>{item.variant}</p>
                              )}
                              <p style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                                Qty: {item.quantity} × {fmt(item.unitPrice)}
                              </p>
                            </td>
                            <td align="right" style={{ whiteSpace: 'nowrap' }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: c.textPrimary }}>
                                {fmt(item.unitPrice * item.quantity)}
                              </p>
                              <p style={{ fontSize: 11, color: c.textMuted }}>
                                GST: {fmt(item.gstAmount)}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}

                {/* Vendor subtotal */}
                <tr>
                  <td style={{ background: c.bgSurface, padding: '12px 48px 16px' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tbody>
                        <tr>
                          <td align="right">
                            <p style={{ fontSize: 12, color: c.textMuted }}>
                              Subtotal for {so.vendorName}:&nbsp;
                              <strong style={{ color: c.textPrimary }}>{fmt(so.subtotal)}</strong>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Separator between vendors */}
                {soIdx < subOrders.length - 1 && (
                  <tr>
                    <td style={{ background: c.bgSurface, padding: '0 48px' }}>
                      <hr style={{ border: 'none', borderTop: `1px dashed ${c.border}`, margin: 0 }} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* ── Order Total ───────────────────────────────────────────────── */}
            <tr>
              <td
                style={{
                  background: c.bgDark,
                  padding: '24px 48px',
                }}
              >
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td>
                        <p
                          style={{
                            fontFamily: 'Cormorant, Georgia, serif',
                            fontSize: 20,
                            color: c.textInverse,
                            margin: 0,
                          }}
                        >
                          Total Paid
                        </p>
                      </td>
                      <td align="right">
                        <p
                          style={{
                            fontFamily: 'Cormorant, Georgia, serif',
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#fff',
                            margin: 0,
                          }}
                        >
                          {fmt(totalAmount)}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Shipping Address ─────────────────────────────────────────── */}
            <tr>
              <td style={{ background: c.bg, padding: '28px 48px', borderTop: `1px solid ${c.border}` }}>
                <p
                  style={{
                    fontSize: 11,
                    color: c.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 8,
                  }}
                >
                  Shipping To
                </p>
                <p style={{ fontSize: 14, color: c.textPrimary, lineHeight: 1.6 }}>
                  {shippingAddress.line1}
                  {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
                </p>
              </td>
            </tr>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <tr>
              <td style={{ background: c.bg, padding: '0 48px 32px', textAlign: 'center' }}>
                <a
                  href={orderUrl}
                  style={{
                    display: 'inline-block',
                    background: c.accent,
                    color: '#fff',
                    fontFamily: 'DM Sans, Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '14px 36px',
                    borderRadius: 4,
                    textDecoration: 'none',
                  }}
                >
                  Track Your Order
                </a>
              </td>
            </tr>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <tr>
              <td
                style={{
                  background: c.bgSurface,
                  borderTop: `1px solid ${c.border}`,
                  borderRadius: '0 0 12px 12px',
                  padding: '24px 48px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.7 }}>
                  © {new Date().getFullYear()} Ordr Artisanal Marketplace. All rights reserved.
                  <br />
                  This email was sent because you placed an order on Ordr.
                  <br />
                  Questions? Reply to this email or visit our{' '}
                  <a href={orderUrl} style={{ color: c.accent }}>
                    Help Centre
                  </a>
                  .
                </p>
              </td>
            </tr>

          </tbody>
        </table>
      </body>
    </html>
  );
}
