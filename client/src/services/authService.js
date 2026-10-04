import { apiRequest } from '../lib/api';

export async function register(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function login(identifier, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
}

export async function me() {
  return apiRequest('/auth/me');
}

export async function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export async function updateMe(data) {
  return apiRequest('/auth/me', {
    method: 'PUT',
    body: data,
  });
}

export async function changePassword(data) {
  return apiRequest('/auth/password', {
    method: 'PUT',
    body: data,
  });
}
