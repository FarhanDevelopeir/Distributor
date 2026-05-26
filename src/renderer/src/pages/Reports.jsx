// src/renderer/src/pages/Reports.jsx
import React from 'react';

export default function Reports() {
  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-subtitle">Business analytics and summaries</p>
        </div>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-primary-800">Reports Coming Soon</p>
          <p className="text-xs text-primary-400 mt-1">Sales reports, distributor statements, and inventory analysis will appear here.</p>
        </div>
      </div>
    </div>
  );
}
