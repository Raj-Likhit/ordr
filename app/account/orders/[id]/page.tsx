'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface StatusHistoryEntry {
  id: string;
  status: string;
  changed_at: string;
  note?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
    product?: { id: string; title: string; slug: string };
  };
}

interface SubOrder {
  id: string;
  status: string;
  subtotal: number;
  tracking_id?: string;
  created_at: string;
  updated_at: string;
  vendor?: { id: string; business_name: string };
  order_items: OrderItem[];
  order_status_history: StatusHistoryEntry[];
}

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  razorpay_payment_id?: string;
  created_at: string;
  address?: { label?: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  sub_orders: SubOrder[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));

const fmtDateShort = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  );

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  placed:    { label: 'Order Placed',  Icon: Clock,         color: '#B97A1A', bg: 'rgba(185,122,26,0.12)' },
  confirmed: { label: 'Confirmed',     Icon: AlertCircle,   color: 'var(--color-accent)', bg: 'rgba(200,75,15,0.10)' },
  shipped:   { label: 'Shipped',       Icon: Truck,         color: 'var(--color-success)', bg: 'rgba(46,107,79,0.10)' },
  delivered: { label: 'Delivered',     Icon: CheckCircle,   color: 'var(--color-success)', bg: 'rgba(46,107,79,0.15)' },
  cancelled: { label: 'Cancelled',     Icon: XCircle,       color: 'var(--color-error)',   bg: 'rgba(192,57,43,0.10)' },
  returned:  { label: 'Returned',      Icon: XCircle,       color: 'var(--color-error)',   bg: 'rgba(192,57,43,0.10)' },
};

const TIMELINE_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Status Timeline
// ─────────────────────────────────────────────────────────────────────────────
function DeliveryTimeline({
  status,
  history,
}: {
  status: string;
  history: StatusHistoryEntry[];
}) {
  const isCancelled = status === 'cancelled' || status === 'returned';
  const currentIdx = TIMELINE_STEPS.indexOf(status);

  return (
    <div style={{ padding: 'var(--space-4) 0' }}>
      {isCancelled ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(192,57,43,0.10)',
            color: 'var(--color-error)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-small)',
            fontWeight: 700,
          }}
        >
          <XCircle size={14} />
          {status === 'returned' ? 'Order Returned' : 'Order Cancelled'}
        </div>
      ) : (
        <ol
          style={{
            display: 'flex',
            gap: 0,
            position: 'relative',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
          aria-label="Order delivery timeline"
        >
          {TIMELINE_STEPS.map((step, idx) => {
            const done = currentIdx >= idx;
            const active = currentIdx === idx;
            const cfg = STATUS_CFG[step];
            const Icon = cfg.Icon;
            const histEntry = history.find((h) => h.status === step);

            return (
              <li
                key={step}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
                aria-current={active ? 'step' : undefined}
              >
                {/* Connector line */}
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: '50%',
                      width: '100%',
                      height: 2,
                      background:
                        done && currentIdx > idx
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                      transition: 'background 0.3s',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Icon circle */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: done
                      ? active
                        ? 'var(--color-accent)'
                        : 'var(--color-success)'
                      : 'var(--color-bg-surface)',
                    border: `2px solid ${
                      done
                        ? active
                          ? 'var(--color-accent)'
                          : 'var(--color-success)'
                        : 'var(--color-border)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: done ? '#fff' : 'var(--color-text-muted)',
                    zIndex: 1,
                    position: 'relative',
                    transition: 'all 0.3s',
                    boxShadow: active ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  <Icon size={16} />
                </div>

                {/* Label */}
                <p
                  style={{
                    fontSize: 'var(--text-micro)',
                    fontWeight: done ? 700 : 400,
                    color: done
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    textAlign: 'center',
                    marginTop: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {cfg.label}
                </p>

                {histEntry && (
                  <p
                    style={{
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      textAlign: 'center',
                      marginTop: 2,
                    }}
                  >
                    {fmtDateShort(histEntry.changed_at)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {/* History detail */}
      {history.length > 0 && (
        <details style={{ marginTop: 'var(--space-6)' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 'var(--text-small)',
              color: 'var(--color-accent)',
              fontWeight: 600,
              listStyle: 'none',
              userSelect: 'none',
            }}
          >
            View full status history
          </summary>
          <ul style={{ marginTop: 'var(--space-3)', listStyle: 'none', padding: 0 }}>
            {history.map((h, i) => (
              <li
                key={h.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  borderBottom:
                    i < history.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <time
                  dateTime={h.changed_at}
                  style={{
                    fontSize: 'var(--text-micro)',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    paddingTop: 2,
                    minWidth: 100,
                  }}
                >
                  {fmtDate(h.changed_at)}
                </time>
                <div>
                  <p
                    style={{
                      fontSize: 'var(--text-small)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {h.status.replace(/_/g, ' ')}
                  </p>
                  {h.note && (
                    <p
                      style={{
                        fontSize: 'var(--text-micro)',
                        color: 'var(--color-text-secondary)',
                        marginTop: 2,
                      }}
                    >
                      {h.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Order Card
// ─────────────────────────────────────────────────────────────────────────────
function SubOrderCard({ so }: { so: SubOrder }) {
  const cfg = STATUS_CFG[so.status] ?? STATUS_CFG.placed;
  const Icon = cfg.Icon;

  return (
    <section
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: 'var(--space-5)',
      }}
    >
      {/* Vendor header */}
      <header
        style={{
          padding: 'var(--space-4) var(--space-6)',
          background: 'var(--color-bg-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 'var(--text-micro)',
              color: '#9C9289',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 2,
            }}
          >
            Sold by
          </p>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-subtitle)',
              color: 'var(--color-text-inverse)',
              margin: 0,
            }}
          >
            {so.vendor?.business_name ?? 'Artisan'}
          </h3>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: cfg.bg,
            color: cfg.color,
            fontSize: 'var(--text-label)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Icon size={12} />
          {cfg.label}
        </span>
      </header>

      {/* Tracking badge */}
      {so.tracking_id && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-6)',
            background: 'rgba(46,107,79,0.06)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Truck size={14} style={{ color: 'var(--color-success)' }} />
          <p
            style={{
              fontSize: 'var(--text-small)',
              color: 'var(--color-success)',
              fontWeight: 500,
            }}
          >
            Tracking ID:{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {so.tracking_id}
            </span>
          </p>
        </div>
      )}

      {/* Timeline */}
      <div style={{ padding: '0 var(--space-6) var(--space-4)' }}>
        <DeliveryTimeline status={so.status} history={so.order_status_history} />
      </div>

      {/* Items */}
      <div style={{ padding: '0 var(--space-6) var(--space-5)' }}>
        <h4
          style={{
            fontSize: 'var(--text-micro)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 'var(--space-3)',
          }}
        >
          Items
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {so.order_items.map((item, i) => {
            const variantLabel = [item.variant?.size, item.variant?.color]
              .filter(Boolean)
              .join(' / ');
            return (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3) 0',
                  borderBottom:
                    i < so.order_items.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    {item.variant?.product?.title ?? 'Unknown Product'}
                  </p>
                  {variantLabel && (
                    <p
                      style={{
                        fontSize: 'var(--text-micro)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {variantLabel}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-text-secondary)',
                      marginTop: 2,
                    }}
                  >
                    Qty {item.quantity} × {fmt(item.unit_price)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {fmt(item.unit_price * item.quantity)}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-micro)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    GST: {fmt(item.gst_amount)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Vendor subtotal footer */}
      <footer
        style={{
          padding: 'var(--space-3) var(--space-6)',
          background: 'var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
          Subtotal:&nbsp;
          <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {fmt(so.subtotal)}
          </strong>
        </p>
      </footer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setOrder(d.order);
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          padding: 'var(--space-8) var(--space-4)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {[1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="skeleton"
              style={{
                height: k === 1 ? 40 : 24,
                width: `${90 - k * 10}%`,
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
              }}
            />
          ))}
          <div
            className="skeleton"
            style={{ height: 300, borderRadius: 'var(--radius-md)' }}
          />
        </div>
      </main>
    );
  }

  // Error / not found
  if (error || !order) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          padding: 'var(--space-8) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Package
            size={48}
            strokeWidth={1.2}
            style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Order not found
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-small)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {error ?? 'This order does not exist or you do not have access.'}
          </p>
          <Link
            href="/account/orders"
            style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none' }}
          >
            ← Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const addr = order.address as any;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Back nav */}
        <Link
          href="/account/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-small)',
            textDecoration: 'none',
            marginBottom: 'var(--space-6)',
            transition: 'color 0.15s',
          }}
        >
          <ArrowLeft size={16} />
          My Orders
        </Link>

        {/* Order header card */}
        <div
          style={{
            background: 'var(--color-bg-dark)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-6)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-6)',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 'var(--text-micro)',
                color: '#9C9289',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 4,
              }}
            >
              Order ID
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 'var(--text-body-lg)',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 'var(--text-micro)',
                color: '#9C9289',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 4,
              }}
            >
              Placed On
            </p>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-inverse)' }}>
              {fmtDateShort(order.created_at)}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 'var(--text-micro)',
                color: '#9C9289',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 4,
              }}
            >
              Total Paid
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-title)',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {fmt(order.total_amount)}
            </p>
          </div>
          {order.razorpay_payment_id && (
            <div>
              <p
                style={{
                  fontSize: 'var(--text-micro)',
                  color: '#9C9289',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 4,
                }}
              >
                Payment Ref
              </p>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {order.razorpay_payment_id}
              </p>
            </div>
          )}
        </div>

        {/* Shipping address */}
        {addr && (
          <div
            style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-5) var(--space-6)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              gap: 'var(--space-3)',
            }}
          >
            <MapPin
              size={18}
              style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <p
                style={{
                  fontSize: 'var(--text-small)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: 2,
                }}
              >
                Shipping Address
              </p>
              <p
                style={{
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ''}
                <br />
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Sub-orders section header */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {order.sub_orders.length} Vendor
          {order.sub_orders.length !== 1 ? 's' : ''}
        </h2>

        {order.sub_orders.map((so) => (
          <SubOrderCard key={so.id} so={so} />
        ))}
      </div>
    </main>
  );
}
