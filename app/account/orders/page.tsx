'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  displayStatus: OrderStatus;
  totalItems: number;
  vendorCount: number;
  address?: { line1: string; city: string; state: string; pincode: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; bg: string; text: string; dot: string }
> = {
  placed: {
    label: 'Order Placed',
    icon: Clock,
    bg: 'rgba(185, 122, 26, 0.12)',
    text: '#B97A1A',
    dot: '#B97A1A',
  },
  processing: {
    label: 'Processing',
    icon: AlertCircle,
    bg: 'rgba(200, 75, 15, 0.10)',
    text: 'var(--color-accent)',
    dot: 'var(--color-accent)',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    bg: 'rgba(46, 107, 79, 0.10)',
    text: 'var(--color-success)',
    dot: 'var(--color-success)',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    bg: 'rgba(46, 107, 79, 0.15)',
    text: 'var(--color-success)',
    dot: 'var(--color-success)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    bg: 'rgba(192, 57, 43, 0.10)',
    text: 'var(--color-error)',
    dot: 'var(--color-error)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.placed;
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: cfg.bg,
        color: cfg.text,
        fontSize: 'var(--text-label)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
      }}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        border: '1px solid var(--color-border)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {[1, 2, 3].map((k) => (
        <div
          key={k}
          className="skeleton"
          style={{
            height: k === 1 ? 20 : 14,
            width: k === 1 ? '40%' : k === 2 ? '60%' : '30%',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 10,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
function EmptyOrders() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-8)',
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <ShoppingBag
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
        No orders yet
      </h3>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-small)',
          marginBottom: 'var(--space-6)',
        }}
      >
        When you place an order, it&apos;ll appear here.
      </p>
      <Link
        href="/shop"
        style={{
          display: 'inline-block',
          background: 'var(--color-accent)',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          fontSize: 'var(--text-small)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          transition: 'background 0.2s',
        }}
      >
        Explore Collection
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Order card
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  return (
    <article
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-6)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div>
          <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
            Order ID
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={order.displayStatus} />
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        <div>
          <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            Date
          </p>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {fmtDate(order.created_at)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            Items
          </p>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
            {order.totalItems} item{order.totalItems !== 1 ? 's' : ''} from {order.vendorCount} vendor{order.vendorCount !== 1 ? 's' : ''}
          </p>
        </div>
        {order.address && (
          <div>
            <p style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Shipping to
            </p>
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
              {order.address.city}, {order.address.state}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '0 0 var(--space-4)' }} />

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subtitle)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {fmt(order.total_amount)}
        </p>
        <Link
          href={`/account/orders/${order.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--color-accent)',
            fontSize: 'var(--text-small)',
            fontWeight: 700,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          View Details <ChevronRight size={14} />
        </Link>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setOrders(d.orders ?? []);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filters: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.displayStatus === filter);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-8) var(--space-4)',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <Package size={24} style={{ color: 'var(--color-accent)' }} />
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-display)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              My Orders
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-small)' }}>
            {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
          </p>
        </header>

        {/* ── Status filter tabs ─────────────────────────────────────────── */}
        <nav
          data-tour-id="profile-orders"
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-1)',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
          aria-label="Filter orders by status"
        >
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
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
              }}
              aria-pressed={filter === key}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── Error state ───────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            style={{
              padding: 'var(--space-4)',
              background: 'rgba(192, 57, 43, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-small)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {error}
          </div>
        )}

        {/* ── Loading skeletons ─────────────────────────────────────────── */}
        {loading && (
          <section aria-busy="true" aria-label="Loading orders">
            {[1, 2, 3].map((k) => <OrderSkeleton key={k} />)}
          </section>
        )}

        {/* ── Order list ────────────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              filter === 'all' ? (
                <EmptyOrders />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-12)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-body)',
                  }}
                >
                  No {filter} orders.
                </div>
              )
            ) : (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
