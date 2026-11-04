import React from 'react';

export default function StatCard({ title, value, icon: Icon, description, trend, trendType = 'neutral' }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-subtle hover:border-gray-300 transition-all duration-200 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary truncate">{title}</span>
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary-light/50 transition-all flex-shrink-0">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${
                trendType === 'positive'
                  ? 'bg-emerald-50 text-success border border-emerald-100'
                  : trendType === 'negative'
                  ? 'bg-rose-50 text-danger border border-rose-100'
                  : 'bg-gray-100 text-secondary'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-[11px] text-secondary truncate mt-1">{description}</p>
      )}
    </div>
  );
}
