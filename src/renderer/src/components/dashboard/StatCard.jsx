// src/renderer/src/components/dashboard/StatCard.jsx

import React from 'react';

/**
 * @param {string}  title
 * @param {string}  value
 * @param {string}  [subtitle]
 * @param {string}  [trend]     e.g. "+12%" or "-3%"
 * @param {boolean} [trendUp]
 * @param {string}  [iconPath]  SVG path d attribute
 * @param {string}  [accent]    Tailwind color name: 'blue' | 'green' | 'yellow' | 'red'
 */
export default function StatCard({ title, value, subtitle, trend, trendUp, iconPath, accent = 'blue' }) {
  const accents = {
    blue:   { icon: 'bg-primary-100 text-primary-600', badge: 'bg-primary-50 text-primary-600' },
    green:  { icon: 'bg-green-100 text-green-600',     badge: 'bg-green-50 text-green-700'     },
    yellow: { icon: 'bg-yellow-100 text-yellow-600',   badge: 'bg-yellow-50 text-yellow-700'   },
    red:    { icon: 'bg-red-100 text-red-600',         badge: 'bg-red-50 text-red-700'         },
  };
  const a = accents[accent] || accents.blue;

  return (
    <div className="card p-4 flex items-start gap-3">
      {iconPath && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.icon}`}>
          <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-semibold text-primary-900 mt-0.5 leading-none text-money">{value}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {subtitle && <span className="text-2xs text-primary-400">{subtitle}</span>}
          {trend && (
            <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${a.badge}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
