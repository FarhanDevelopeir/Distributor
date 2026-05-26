// src/renderer/src/components/shared/States.jsx

import React from 'react';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-primary-400">
      <svg className={`${sz} animate-spin`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-xs">{text}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary-800">Something went wrong</p>
        <p className="text-xs text-primary-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No data found', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center">
        <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary-700">{title}</p>
        {subtitle && <p className="text-xs text-primary-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
