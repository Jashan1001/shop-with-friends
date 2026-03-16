import api from './axios'

export const getProducts = (roomId) => api.get(`/rooms/${roomId}/products`)
export const addProduct = (roomId, data) => api.post(`/rooms/${roomId}/products`, data)
export const updateProduct = (roomId, productId, data) => api.put(`/rooms/${roomId}/products/${productId}`, data)
export const deleteProduct = (roomId, productId) => api.delete(`/rooms/${roomId}/products/${productId}`)
export const updateProductStatus = (roomId, productId, status) => api.put(`/rooms/${roomId}/products/${productId}/status`, { status })
export const scrapeProduct = (url) => api.post('/products/scrape', { url })