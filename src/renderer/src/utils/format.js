// src/renderer/src/utils/format.js

export const fmt = {
  /** Format number as currency  e.g. 12500 → "12,500.00" */
  money: (n, symbol = 'PKR') =>
    `${symbol} ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,

  /** Short money for dashboard cards  12500 → "12.5K" */
  moneyShort: (n) => {
    const v = Number(n || 0);
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
    return v.toFixed(0);
  },

  /** Format date  "2024-01-15" → "15 Jan 2024" */
  date: (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',

  /** Format date + time */
  datetime: (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',

  /** Capitalize first letter */
  capitalize: (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '',
};

/** Map order status → badge class */
export const statusBadge = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
  active:    'badge-green',
  inactive:  'badge-gray',
};
