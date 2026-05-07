async function readJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

function normalizeApiBaseUrl(inputBaseUrl) {
  const raw = String(inputBaseUrl || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  // If user stored origin only (e.g. http://localhost:3001), assume API lives under /api
  if (!/\/api(\/|$)/i.test(raw)) return `${raw}/api`;
  return raw;
}

export async function apiJson({ baseUrl, path, method = 'GET', token, body }) {
  const b = normalizeApiBaseUrl(baseUrl);
  const res = await fetch(`${b}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await readJson(res);
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Request failed';
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

export async function apiForm({ baseUrl, path, method = 'POST', token, formData }) {
  const b = normalizeApiBaseUrl(baseUrl);
  const res = await fetch(`${b}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await readJson(res);
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Request failed';
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

