import * as React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Ordr Abandoned Cart Email — React Email template
// ─────────────────────────────────────────────────────────────────────────────

interface CartItem {
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface AbandonedCartProps {
  buyerName: string;
  cartUrl: string;
  items: CartItem[];
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
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function AbandonedCart({
  buyerName = "Artisan Lover",
  cartUrl = "https://ordr-green.vercel.app/cart",
  items = []
}: AbandonedCartProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Did you forget something? — Ordr</title>
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
                    textAlign: 'center'
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <h1 style={{ fontFamily: 'Cormorant, serif', fontSize: '32px', color: c.textInverse, fontWeight: 600, letterSpacing: '-0.02em' }}>
                          Ordr
                        </h1>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <tr>
              <td>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    background: '#FFFFFF',
                    padding: '48px',
                    borderLeft: `1px solid ${c.border}`,
                    borderRight: `1px solid ${c.border}`,
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <h2 style={{ fontFamily: 'Cormorant, serif', fontSize: '28px', color: c.textPrimary, marginBottom: '16px' }}>
                          Hi {buyerName.split(' ')[0]},
                        </h2>
                        <p style={{ fontSize: '16px', lineHeight: '1.6', color: c.textSecondary, marginBottom: '32px' }}>
                          We noticed you left some beautiful artisanal pieces in your cart. They are still waiting for you, but they might sell out soon!
                        </p>
                      </td>
                    </tr>

                    {/* ── Items ─────────────────────────────────────────────────── */}
                    <tr>
                      <td>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '32px' }}>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '16px 0', borderBottom: `1px solid ${c.border}` }}>
                                  <table width="100%" cellPadding="0" cellSpacing="0">
                                    <tbody>
                                      <tr>
                                        <td width="80" style={{ verticalAlign: 'top' }}>
                                          <img 
                                            src={item.image || "https://ordr-green.vercel.app/assets/product-card-placeholder.png"} 
                                            alt={item.name} 
                                            style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: c.bgSurface }}
                                          />
                                        </td>
                                        <td style={{ paddingLeft: '16px', verticalAlign: 'top' }}>
                                          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, marginBottom: '4px' }}>
                                            {item.name}
                                          </p>
                                          {item.variant && (
                                            <p style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '4px' }}>
                                              {item.variant}
                                            </p>
                                          )}
                                          <p style={{ fontSize: '14px', color: c.textMuted }}>
                                            Qty: {item.quantity} × {fmt(item.unitPrice)}
                                          </p>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* ── CTA ───────────────────────────────────────────────────── */}
                    <tr>
                      <td align="center">
                        <a 
                          href={cartUrl}
                          style={{
                            display: 'inline-block',
                            background: c.accent,
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: 600,
                            padding: '16px 32px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            marginTop: '16px',
                          }}
                        >
                          Complete Your Order
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <tr>
              <td>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    background: c.bgSurface,
                    borderRadius: '0 0 12px 12px',
                    padding: '32px 48px',
                    border: `1px solid ${c.border}`,
                    borderTop: 'none',
                  }}
                >
                  <tbody>
                    <tr>
                      <td align="center">
                        <p style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '16px' }}>
                          If you have any questions, simply reply to this email. We're here to help!
                        </p>
                        <p style={{ fontSize: '12px', color: c.textMuted }}>
                          &copy; {new Date().getFullYear()} Ordr. Artisanal Marketplace.<br />
                          Made with ❤️ for independent creators.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

          </tbody>
        </table>
      </body>
    </html>
  );
}
