import api from './axios'

export const vote = (productId, value) => api.post(`/products/${productId}/vote`, { value })
export const removeVote = (productId) => api.delete(`/products/${productId}/vote`)