async function readJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

export async function apiJson({ baseUrl, path, method = 'GET', token, body }) {
  const res = await fetch(`${baseUrl}${path}`, {
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
  const res = await fetch(`${baseUrl}${path}`, {
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

