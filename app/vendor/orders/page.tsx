'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ChevronDown,
  MapPin,
  User,
  RefreshCw,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Buyer {
  id: string;
  full_name?: string;
  phone?: string;
}

interface Address {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

interface ParentOrder {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  address?: Address;
  buyer?: Buyer;
}

interface OrderItemVariant {
  size?: string;
  color?: string;
  sku?: string;
  product?: { id: string; title: string; slug: string };
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  variant?: OrderItemVariant;
}

interface SubOrder {
  id: string;
  status: string;
  subtotal: number;
  tracking_id?: string;
  created_at: string;
  updated_at: string;
  order?: ParentOrder;
  order_items: OrderItem[];
  order_status_history: { id: string; status: string; changed_at: string; note?: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  string,
  { label: string; Icon: React.ElementType; color: string; bg: string; border: string }
> = {
  placed: {
    label: 'Placed',
    Icon: Clock,
    color: '#B97A1A',
    bg: 'rgba(185,122,26,0.10)',
    border: 'rgba(185,122,26,0.30)',
  },
  confirmed: {
    label: 'Confirmed',
    Icon: AlertCircle,
    color: '#C84B0F',
    bg: 'rgba(200,75,15,0.08)',
    border: 'rgba(200,75,15,0.30)',
  },
  shipped: {
    label: 'Shipped',
    Icon: Truck,
    color: '#2E6B4F',
    bg: 'rgba(46,107,79,0.08)',
    border: 'rgba(46,107,79,0.30)',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    Icon: Truck,
    color: '#2E6B4F',
    bg: 'rgba(46,107,79,0.10)',
    border: 'rgba(46,107,79,0.35)',
  },
  delivered: {
    label: 'Delivered',
    Icon: CheckCircle,
    color: '#2E6B4F',
    bg: 'rgba(46,107,79,0.12)',
    border: 'rgba(46,107,79,0.40)',
  },
  cancelled: {
    label: 'Cancelled',
    Icon: XCircle,
    color: '#C0392B',
    bg: 'rgba(192,57,43,0.08)',
    border: 'rgba(192,57,43,0.30)',
  },
  returned: {
    label: 'Returned',
    Icon: XCircle,
    color: '#C0392B',
    bg: 'rgba(192,57,43,0.08)',
    border: 'rgba(192,57,43,0.30)',
  },
};

// Valid next states for the state machine
const NEXT_STATES: Record<string, string[]> = {
  placed:    ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped:   ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
  returned:  [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.placed;
  const Icon = cfg.Icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: 'var(--text-label)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
      }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Button (state transition)
// ─────────────────────────────────────────────────────────────────────────────
interface ActionButtonProps {
  subOrderId: string;
  nextStatus: string;
  trackingRequired?: boolean;
  onSuccess: (subOrderId: string, newStatus: string, trackingId?: string) => void;
}

function ActionButton({ subOrderId, nextStatus, trackingRequired, onSuccess }: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [note, setNote] = useState('');

  const cfg = STATUS_CFG[nextStatus];
  const needsTracking = nextStatus === 'shipped';

  const handleClick = async () => {
    if (needsTracking && !showTracking) {
      setShowTracking(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId,
          status: nextStatus,
          tracking_id: trackingId || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Failed to update status');
        return;
      }
      onSuccess(subOrderId, nextStatus, trackingId || undefined);
      setShowTracking(false);
      setTrackingId('');
      setNote('');
    } catch {
      alert('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const isDestructive = nextStatus === 'cancelled';

  return (
    <div>
      {showTracking && needsTracking && (
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <label
            htmlFor={`tracking-${subOrderId}`}
            style={{
              display: 'block',
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            Tracking ID (optional)
          </label>
          <input
            id={`tracking-${subOrderId}`}
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. DTDC123456789"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-small)',
              marginBottom: 8,
              outline: 'none',
            }}
          />
          <label
            htmlFor={`note-${subOrderId}`}
            style={{
              display: 'block',
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            Note (optional)
          </label>
          <input
            id={`note-${subOrderId}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Dispatched via DTDC"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-small)',
              outline: 'none',
            }}
          />
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 18px',
          borderRadius: 'var(--radius-sm)',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 'var(--text-small)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: isDestructive
            ? 'rgba(192,57,43,0.10)'
            : 'var(--color-accent)',
          color: isDestructive ? 'var(--color-error)' : '#fff',
          border: isDestructive ? '1px solid rgba(192,57,43,0.30)' : 'none',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.15s, background 0.15s',
        }}
      >
        {loading ? (
          <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <cfg.Icon size={13} />
        )}
        {loading ? 'Updating…' : `Mark as ${cfg.label}`}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Order Card
// ─────────────────────────────────────────────────────────────────────────────
function SubOrderCard({
  so,
  onStatusUpdated,
}: {
  so: SubOrder;
  onStatusUpdated: (id: string, newStatus: string, trackingId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const order = so.order as ParentOrder | undefined;
  const buyer = order?.buyer as Buyer | undefined;
  const addr = order?.address as Address | undefined;
  const nextStates = NEXT_STATES[so.status] ?? [];

  return (
    <article
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Card header ────────────────────────────────────────────────── */}
      <header
        style={{
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p
            style={{
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Order #{order?.id?.slice(0, 8).toUpperCase() ?? '—'}
          </p>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {fmtDate(so.created_at)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <StatusBadge status={so.status} />
          <button
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              padding: '5px 8px',
              color: 'var(--color-text-secondary)',
              transition: 'background 0.15s',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronDown
              size={16}
              style={{
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Summary row ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          gap: 'var(--space-8)',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Buyer */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <User size={16} style={{ color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: 'var(--text-micro)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 2,
              }}
            >
              Customer
            </p>
            <p style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {buyer?.full_name ?? 'Anonymous'}
            </p>
            {buyer?.phone && (
              <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
                {buyer.phone}
              </p>
            )}
          </div>
        </div>

        {/* Ship to */}
        {addr && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
            <MapPin size={16} style={{ color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p
                style={{
                  fontSize: 'var(--text-micro)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 2,
                }}
              >
                Ship to
              </p>
              <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div>
          <p
            style={{
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 2,
            }}
          >
            Subtotal
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-subtitle)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {fmt(so.subtotal)}
          </p>
        </div>
      </div>

      {/* ── Expanded: items + actions ────────────────────────────────────── */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: 'var(--space-5) var(--space-6)',
          }}
        >
          {/* Items table */}
          <h4
            style={{
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 'var(--space-3)',
            }}
          >
            Items ({so.order_items.reduce((sum, item) => sum + item.quantity, 0)})
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-5)' }}>
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
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-2) 0',
                    borderBottom:
                      i < so.order_items.length - 1
                        ? '1px solid var(--color-border)'
                        : 'none',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 'var(--text-small)',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {item.variant?.product?.title ?? 'Unknown Product'}
                    </p>
                    {variantLabel && (
                      <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>
                        {variantLabel}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                      {item.quantity} × {fmt(item.unit_price)}
                    </p>
                    <p style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {fmt(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Tracking badge (if already shipped) */}
          {so.tracking_id && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(46,107,79,0.08)',
                color: 'var(--color-success)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-small)',
                fontWeight: 500,
                marginBottom: 'var(--space-4)',
              }}
            >
              <Truck size={14} />
              Tracking: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{so.tracking_id}</span>
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────────────── */}
          {nextStates.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 'var(--text-micro)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Update Status
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', flexDirection: 'column' }}>
                {nextStates.map((ns) => (
                  <ActionButton
                    key={ns}
                    subOrderId={so.id}
                    nextStatus={ns}
                    onSuccess={onStatusUpdated}
                  />
                ))}
              </div>
            </div>
          )}

          {so.status === 'delivered' && (
            <p
              style={{
                fontSize: 'var(--text-small)',
                color: 'var(--color-success)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={14} />
              Order completed — no further actions needed.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'placed', label: 'New' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

import { BulkFulfillModal } from '@/components/vendor/BulkFulfillModal';

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function VendorOrdersPage() {
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/vendor/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSubOrders(d.subOrders ?? []);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Optimistic status update
  const handleStatusUpdated = (id: string, newStatus: string, trackingId?: string) => {
    setSubOrders((prev) =>
      prev.map((so) =>
        so.id === id
          ? {
              ...so,
              status: newStatus,
              tracking_id: trackingId ?? so.tracking_id,
              order_status_history: [
                ...so.order_status_history,
                { id: `temp-${Date.now()}`, status: newStatus, changed_at: new Date().toISOString() },
              ],
            }
          : so
      )
    );
  };

  const filtered = filter === 'all' ? subOrders : subOrders.filter((s) => s.status === filter);

  // Count per status for badges
  const counts: Record<string, number> = { all: subOrders.length };
  subOrders.forEach((so) => {
    counts[so.status] = (counts[so.status] ?? 0) + 1;
  });

  const confirmedCount = counts['confirmed'] || 0;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-8) var(--space-6)',
      }}
    >
      <BulkFulfillModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        orders={subOrders} 
        onSuccess={load}
      />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
            <Package size={26} style={{ color: 'var(--color-accent)' }} />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-display)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Orders
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-small)' }}>
            {loading ? 'Loading…' : `${subOrders.length} sub-order${subOrders.length !== 1 ? 's' : ''} assigned to you`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            disabled={loading || confirmedCount === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: confirmedCount > 0 ? 'var(--color-accent)' : 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: loading || confirmedCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              color: confirmedCount > 0 ? '#fff' : 'var(--color-text-muted)',
              transition: 'background 0.15s',
            }}
          >
            <Truck size={14} />
            Bulk Fulfill ({confirmedCount})
          </button>
          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              transition: 'background 0.15s',
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Status filter tabs ─────────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-1)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          width: 'fit-content',
        }}
        aria-label="Filter sub-orders by status"
      >
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-small)',
              fontWeight: filter === key ? 700 : 400,
              background: filter === key ? 'var(--color-accent)' : 'transparent',
              color: filter === key ? '#fff' : 'var(--color-text-secondary)',
              transition: 'background 0.15s, color 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {label}
            {counts[key] > 0 && (
              <span
                style={{
                  background: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--color-border)',
                  color: filter === key ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-4)',
            background: 'rgba(192, 57, 43, 0.08)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: 'var(--text-small)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Loading skeletons ─────────────────────────────────────────────── */}
      {loading && (
        <section aria-busy="true" aria-label="Loading orders">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="skeleton"
              style={{
                height: 120,
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
              }}
            />
          ))}
        </section>
      )}

      {/* ── Order list ─────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-16) var(--space-8)',
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Package
                size={48}
                strokeWidth={1.2}
                style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}
              />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-title)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-small)' }}>
                {filter === 'all'
                  ? "When buyers place orders containing your products, they'll appear here."
                  : `You have no orders in ${filter} status.`}
              </p>
            </div>
          ) : (
            <section
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
              aria-label="Sub-orders list"
            >
              {filtered.map((so) => (
                <SubOrderCard key={so.id} so={so} onStatusUpdated={handleStatusUpdated} />
              ))}
            </section>
          )}
        </>
      )}

      {/* Spin keyframe for the refresh icon */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
