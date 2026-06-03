// src/renderer/src/pages/ProfilePage.jsx

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { companiesAPI, customersAPI, salesmenAPI, deliveryPersonsAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';

const CONFIG = {
  company: {
    back: '/companies',
    label: 'Company Profile',
    fetch: companiesAPI.get,
    name: (d) => d.name,
    subtitle: (d) => d.ownerName || 'Supplier company',
    fields: [
      ['Owner Name', 'ownerName'],
      ['Phone Number', 'phone'],
      ['Address', 'address'],
      ['Notes', 'notes'],
    ],
  },
  customer: {
    back: '/customers',
    label: 'Customer Profile',
    fetch: customersAPI.get,
    name: (d) => d.customerName,
    subtitle: (d) => d.shopName || 'Customer',
    fields: [
      ['Shop Name', 'shopName'],
      ['Phone Number', 'phone'],
      ['Address', 'address'],
    ],
  },
  salesman: {
    back: '/salesmen',
    label: 'Salesman Profile',
    fetch: salesmenAPI.get,
    name: (d) => d.fullName,
    subtitle: (d) => `${d.commissionPercentage || 0}% commission`,
    fields: [
      ['Phone Number', 'phone'],
      ['Address', 'address'],
      ['Commission', (d) => `${d.commissionPercentage || 0}%`],
    ],
  },
  delivery: {
    back: '/delivery-persons',
    label: 'Delivery Person Profile',
    fetch: deliveryPersonsAPI.get,
    name: (d) => d.fullName,
    subtitle: (d) => d.vehicleNo || 'Delivery person',
    fields: [
      ['Phone Number', 'phone'],
      ['Vehicle No.', 'vehicleNo'],
      ['Address', 'address'],
      ['Notes', 'notes'],
    ],
  },
};

function getValue(row, accessor) {
  if (typeof accessor === 'function') return accessor(row) || '—';
  return row?.[accessor] || '—';
}

function InvoiceTable({ invoices = [], title = 'Invoice History' }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="text-sm font-semibold text-primary-900">{title}</p>
          <p className="text-2xs text-primary-400 mt-0.5">{invoices.length} recent records</p>
        </div>
      </div>
      {invoices.length === 0 ? (
        <EmptyState title="No invoice history" subtitle="Invoices linked to this profile will appear here." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Customer</th>
                <th>Salesman</th>
                <th>Delivery</th>
                <th>Date</th>
                <th>Items</th>
                <th className="text-right">Total</th>
                <th className="text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-primary-700">{inv.invoiceNo}</td>
                  <td>
                    <div className="font-medium text-primary-900">{inv.customer?.customerName || '—'}</div>
                    {inv.customer?.shopName && <div className="text-2xs text-primary-400">{inv.customer.shopName}</div>}
                  </td>
                  <td className="text-xs text-primary-600">{inv.salesman?.fullName || '—'}</td>
                  <td className="text-xs text-primary-600">{inv.deliveryPerson?.fullName || '—'}</td>
                  <td className="text-xs text-primary-500">{fmt.date(inv.invoiceDate)}</td>
                  <td><span className="badge-blue">{inv._count?.items ?? inv.items?.length ?? 0}</span></td>
                  <td className="text-right text-money font-semibold text-primary-800">{fmt.money(inv.total)}</td>
                  <td className="text-right text-money text-green-700">{fmt.money(inv.totalProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompanyProducts({ products = [] }) {
  const invoiceItems = products.flatMap(product =>
    (product.invoiceItems || []).map(item => ({
      ...item,
      productName: product.name,
      productUnit: product.unitType,
    }))
  );

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <div>
            <p className="text-sm font-semibold text-primary-900">Products</p>
            <p className="text-2xs text-primary-400 mt-0.5">{products.length} linked products</p>
          </div>
        </div>
        {products.length === 0 ? (
          <EmptyState title="No products" subtitle="Products linked to this company will appear here." />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th className="text-right">Purchase</th>
                  <th className="text-right">Sale</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="font-medium text-primary-900">{product.name}</td>
                    <td className="text-xs text-primary-500">{product.unitType}</td>
                    <td><span className={product.stockQuantity <= 10 ? 'badge-red' : 'badge-green'}>{product.stockQuantity}</span></td>
                    <td className="text-right text-money">{fmt.money(product.purchasePrice)}</td>
                    <td className="text-right text-money font-semibold text-primary-800">{fmt.money(product.salePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <p className="text-sm font-semibold text-primary-900">Recent Product Sales</p>
            <p className="text-2xs text-primary-400 mt-0.5">Invoices containing this company&apos;s products</p>
          </div>
        </div>
        {invoiceItems.length === 0 ? (
          <EmptyState title="No sales yet" subtitle="Sales for this company's products will appear here." />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium text-primary-900">{item.productName}</td>
                    <td className="font-mono text-xs text-primary-700">{item.invoice?.invoiceNo}</td>
                    <td className="text-xs text-primary-600">{item.invoice?.customer?.customerName || '—'}</td>
                    <td>{item.quantity} {item.productUnit}</td>
                    <td className="text-right text-money">{fmt.money(item.lineTotal)}</td>
                    <td className="text-right text-money text-green-700">{fmt.money(item.lineProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({ type }) {
  const { id } = useParams();
  const config = CONFIG[type];
  const { data, loading, error, refetch } = useFetch(() => config.fetch(id), [id, type]);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return <EmptyState title="Profile not found" />;

  const invoices = data.invoices || [];
  const totals = invoices.reduce((acc, inv) => {
    acc.total += Number(inv.total || 0);
    acc.profit += Number(inv.totalProfit || 0);
    acc.commission += Number(inv.commission || 0);
    return acc;
  }, { total: 0, profit: 0, commission: 0 });

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">{config.label}</h2>
          <p className="page-subtitle">Manager overview and related history</p>
        </div>
        <Link to={config.back} className="btn-secondary btn-sm">Back</Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-4 xl:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-semibold">
              {config.name(data)?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-900">{config.name(data)}</p>
              <p className="text-xs text-primary-400">{config.subtitle(data)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {config.fields.map(([label, accessor]) => (
              <div key={label} className="flex justify-between gap-3 border-t border-primary-50 pt-2 text-xs">
                <span className="text-primary-400">{label}</span>
                <span className="text-primary-800 text-right">{getValue(data, accessor)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-primary-50 pt-2 text-xs">
              <span className="text-primary-400">Created</span>
              <span className="text-primary-800">{fmt.date(data.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card p-3">
            <p className="text-2xs text-primary-400 uppercase font-semibold">Invoices</p>
            <p className="text-xl font-semibold text-primary-900 mt-1">{invoices.length}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-primary-400 uppercase font-semibold">Sales</p>
            <p className="text-xl font-semibold text-primary-900 mt-1">{fmt.moneyShort(totals.total)}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-primary-400 uppercase font-semibold">Profit</p>
            <p className="text-xl font-semibold text-green-700 mt-1">{fmt.moneyShort(totals.profit)}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-primary-400 uppercase font-semibold">Commission</p>
            <p className="text-xl font-semibold text-primary-700 mt-1">{fmt.moneyShort(totals.commission)}</p>
          </div>
        </div>
      </div>

      {type === 'company' ? (
        <CompanyProducts products={data.products || []} />
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
