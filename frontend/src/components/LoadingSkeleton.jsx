import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-card p-5 border border-border shadow-card animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-36"></div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between gap-4">
        <div className="h-9 bg-gray-100 rounded-xl w-64 animate-pulse"></div>
        <div className="h-9 bg-gray-100 rounded-xl w-32 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className={`bg-card rounded-card p-5 border border-border shadow-card animate-pulse ${height} flex flex-col justify-between`}>
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
        <div className="text-xs text-gray-300 font-medium">Loading visualization...</div>
      </div>
    </div>
  );
}

