import React from 'react';

export default function StatusBadge({ status, text }) {
  const display = text || status;
  const s = String(status || '').toUpperCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  if (s === 'AVAILABLE' || s === 'IN STOCK' || s === 'ACTIVE') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'LOW STOCK' || s === 'EXPIRING SOON') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'OUT OF STOCK' || s === 'OVERDUE') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'RETURNED' || s === 'COMPLETED') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (s === 'ISSUED') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {display}
    </span>
  );
}

