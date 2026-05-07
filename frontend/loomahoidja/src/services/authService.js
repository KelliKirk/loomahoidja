import { apiJson } from '../api'
import { resolveApiBaseUrl } from '../lib/apiBaseUrl'

export async function loginUser({ email, password }) {
  return apiJson({
    baseUrl: resolveApiBaseUrl(),
    path: '/auth/login',
    method: 'POST',
    body: { email, password },
  })
}

export async function registerUser({ email, fullName, phone, city, role, password }) {
  return apiJson({
    baseUrl: resolveApiBaseUrl(),
    path: '/auth/register',
    method: 'POST',
    body: { email, fullName, phone, city, role, password },
  })
}