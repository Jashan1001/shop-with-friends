import api from './axios'

export const getProducts    = (roomId)           => api.get(`/rooms/${roomId}/products`)
export const addProduct     = (roomId, data)     => api.post(`/rooms/${roomId}/products`, data)
export const updateProduct  = (roomId, id, data) => api.put(`/rooms/${roomId}/products/${id}`, data)
export const deleteProduct  = (roomId, id)       => api.delete(`/rooms/${roomId}/products/${id}`)
export const updateProductStatus = (roomId, id, status) =>
  api.put(`/rooms/${roomId}/products/${id}/status`, { status })

// Upload a product image — multipart/form-data
export const uploadProductImage = (roomId, productId, file) => {
  const form = new FormData()
  form.append('image', file)
  return api.post(`/rooms/${roomId}/products/${productId}/image`, form)
}