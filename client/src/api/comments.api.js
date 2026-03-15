import api from './axios'

export const getComments = (productId) => api.get(`/products/${productId}/comments`)
export const addComment = (productId, text) => api.post(`/products/${productId}/comments`, { text })
export const deleteComment = (productId, commentId) =>
	api.delete(`/products/${productId}/comments/${commentId}`)