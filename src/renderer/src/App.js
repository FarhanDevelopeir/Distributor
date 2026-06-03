// src/renderer/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';

import Dashboard      from './pages/Dashboard';
import Companies      from './pages/Companies';
import Products       from './pages/Products';
import Salesmen       from './pages/Salesmen';
import Customers      from './pages/Customers';
import DeliveryPersons from './pages/DeliveryPersons';
import Invoices       from './pages/Invoices';
import InvoiceCreate  from './pages/InvoiceCreate';
import ProfilePage    from './pages/ProfilePage';
import Settings       from './pages/Settings';

import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index                element={<Dashboard />} />
          <Route path="companies"     element={<Companies />} />
          <Route path="companies/:id"  element={<ProfilePage type="company" />} />
          <Route path="products"      element={<Products />} />
          <Route path="salesmen"      element={<Salesmen />} />
          <Route path="salesmen/:id"   element={<ProfilePage type="salesman" />} />
          <Route path="customers"     element={<Customers />} />
          <Route path="customers/:id"  element={<ProfilePage type="customer" />} />
          <Route path="delivery-persons" element={<DeliveryPersons />} />
          <Route path="delivery-persons/:id" element={<ProfilePage type="delivery" />} />
          <Route path="invoices"      element={<Invoices />} />
          <Route path="invoices/new"  element={<InvoiceCreate />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
