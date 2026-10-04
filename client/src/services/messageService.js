import { apiRequest } from '../lib/api'

export async function sendContactMessage(data) {
  return apiRequest('/messages', {
    method: 'POST',
    body: data,
  })
}