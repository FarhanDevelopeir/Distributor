// src/renderer/src/components/layout/TopBar.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/':              { title: 'Dashboard',    subtitle: 'Business overview and analytics' },
  '/companies':     { title: 'Companies',    subtitle: 'Manage supplier companies' },
  '/products':      { title: 'Products',     subtitle: 'Product catalog and stock' },
  '/salesmen':      { title: 'Salesmen',     subtitle: 'Sales team management' },
  '/customers':     { title: 'Customers',    subtitle: 'Customer directory' },
  '/invoices':      { title: 'Invoices',     subtitle: 'Sales billing and history' },
  '/invoices/new':  { title: 'New Invoice',  subtitle: 'Create a sales invoice' },
  '/settings':      { title: 'Settings',     subtitle: 'Application preferences' },
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { title, subtitle } = TITLES[pathname] || TITLES['/' + pathname.split('/')[1]] || TITLES['/'];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-12 flex-shrink-0 bg-white border-b border-primary-100 flex items-center px-5 gap-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <h1 className="text-md font-semibold text-primary-900 leading-none">{title}</h1>
        <p className="text-2xs text-primary-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateStr}
        </div>

        <div className="h-5 w-px bg-primary-100" />

        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs text-green-700 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Offline
        </div>

        <div className="w-7 h-7 rounded-full bg-primary-100 border border-primary-200
                        flex items-center justify-center text-2xs font-semibold text-primary-600">
          AD
        </div>
      </div>
    </header>
  );
}
