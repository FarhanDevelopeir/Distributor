// src/renderer/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// ─── SVG Icons (inline, no external dependency) ───────────────────────────────
const icons = {
  dashboard:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  distributors: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  products:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  orders:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
  payments:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
  reports:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  settings:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
};

const Icon = ({ name }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {icons[name]}
  </svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/',             icon: 'dashboard' },
  { label: 'Distributors', path: '/distributors', icon: 'distributors' },
  { label: 'Products',     path: '/products',     icon: 'products' },
  { label: 'Orders',       path: '/orders',       icon: 'orders' },
  { label: 'Payments',     path: '/payments',     icon: 'payments' },
  { label: 'Reports',      path: '/reports',      icon: 'reports' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 flex-shrink-0 bg-primary-900 flex flex-col h-screen select-none">
      {/* ── Logo ──────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-primary-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">DMS</p>
            <p className="text-primary-400 text-2xs leading-tight mt-0.5">Distributor Mgmt.</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-2xs font-semibold text-primary-500 uppercase tracking-widest px-2.5 mb-2">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'}
              `}
            >
              <span className={isActive ? 'text-primary-200' : 'text-primary-400 group-hover:text-primary-300'}>
                <Icon name={icon} />
              </span>
              {label}
              {isActive && (
                <span className="ml-auto w-1 h-4 rounded-full bg-primary-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Settings + Version ────────────────────────── */}
      <div className="px-2.5 py-3 border-t border-primary-800 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium
            transition-all duration-150
            ${isActive ? 'bg-primary-700 text-white' : 'text-primary-400 hover:bg-primary-800 hover:text-white'}
          `}
        >
          <Icon name="settings" />
          Settings
        </NavLink>
        <div className="px-2.5 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-2xs text-primary-500">Offline Mode • v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
