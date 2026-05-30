// src/renderer/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const icons = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  companies: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  products:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  salesmen:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  customers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  invoices:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  settings:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
};

const Icon = ({ name }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {icons[name]}
  </svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/',            icon: 'dashboard' },
  { label: 'Companies', path: '/companies', icon: 'companies' },
  { label: 'Products',  path: '/products',  icon: 'products' },
  { label: 'Salesmen',  path: '/salesmen',  icon: 'salesmen' },
  { label: 'Customers', path: '/customers', icon: 'customers' },
  { label: 'Invoices',  path: '/invoices',  icon: 'invoices' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 flex-shrink-0 bg-primary-900 flex flex-col h-screen select-none">
      <div className="px-5 py-4 border-b border-primary-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">DMS</p>
            <p className="text-primary-400 text-2xs leading-tight mt-0.5">Billing & Inventory</p>
          </div>
        </div>
      </div>

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
