// src/renderer/src/utils/api.js
// All API calls go to local Express server — fully offline

const BASE = 'http://127.0.0.1:4000/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get:    (path)         => request('GET', path),
  post:   (path, body)   => request('POST', path, body),
  put:    (path, body)   => request('PUT', path, body),
  patch:  (path, body)   => request('PATCH', path, body),
  delete: (path)         => request('DELETE', path),
};

function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== '' && v != null);
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
}

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const companiesAPI = {
  list:   (params = {}) => api.get(`/companies${qs(params)}`),
  all:    ()             => api.get('/companies/all'),
  get:    (id)           => api.get(`/companies/${id}`),
  create: (data)         => api.post('/companies', data),
  update: (id, data)     => api.put(`/companies/${id}`, data),
  remove: (id)           => api.delete(`/companies/${id}`),
};

export const productsAPI = {
  list:        (params = {}) => api.get(`/products${qs(params)}`),
  get:         (id)           => api.get(`/products/${id}`),
  create:      (data)         => api.post('/products', data),
  update:      (id, data)     => api.put(`/products/${id}`, data),
  updateStock: (id, data)     => api.patch(`/products/${id}/stock`, data),
  remove:      (id)           => api.delete(`/products/${id}`),
};

export const salesmenAPI = {
  list:   (params = {}) => api.get(`/salesmen${qs(params)}`),
  all:    ()             => api.get('/salesmen/all'),
  get:    (id)           => api.get(`/salesmen/${id}`),
  create: (data)         => api.post('/salesmen', data),
  update: (id, data)     => api.put(`/salesmen/${id}`, data),
  remove: (id)           => api.delete(`/salesmen/${id}`),
};

export const customersAPI = {
  list:   (params = {}) => api.get(`/customers${qs(params)}`),
  all:    ()             => api.get('/customers/all'),
  get:    (id)           => api.get(`/customers/${id}`),
  create: (data)         => api.post('/customers', data),
  update: (id, data)     => api.put(`/customers/${id}`, data),
  remove: (id)           => api.delete(`/customers/${id}`),
};

export const deliveryPersonsAPI = {
  list:   (params = {}) => api.get(`/delivery-persons${qs(params)}`),
  all:    ()             => api.get('/delivery-persons/all'),
  get:    (id)           => api.get(`/delivery-persons/${id}`),
  create: (data)         => api.post('/delivery-persons', data),
  update: (id, data)     => api.put(`/delivery-persons/${id}`, data),
  remove: (id)           => api.delete(`/delivery-persons/${id}`),
};

export const invoicesAPI = {
  list:   (params = {}) => api.get(`/invoices${qs(params)}`),
  get:    (id)           => api.get(`/invoices/${id}`),
  create: (data)         => api.post('/invoices', data),
  remove: (id)           => api.delete(`/invoices/${id}`),
};
