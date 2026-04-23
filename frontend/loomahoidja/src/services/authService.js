const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function loginUser ({ email, password }) {
    return apiJson({ baseUrl: BASE,  path: '/auth/login', method: 'POST', body: { email, password } });
}

export async function registerUser({ email, fullName, phone, city, role, password }) {
    return apiJson({ baseUrl: BASE, path: '/auth/register', method: 'POST', body: { email, fullName, phone, city, role, password } });
}