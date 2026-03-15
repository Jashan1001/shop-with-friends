import api from './axios'

export const createRoom = (data) => api.post('/rooms', data)
export const getRooms = () => api.get('/rooms')
export const getRoom = (roomId) => api.get(`/rooms/${roomId}`)
export const updateRoom = (roomId, data) => api.put(`/rooms/${roomId}`, data)
export const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`)
export const joinRoom = (code) => api.post(`/rooms/join/${code}`)
export const leaveRoom = (roomId) => api.delete(`/rooms/${roomId}/leave`)
export const regenerateInvite = (roomId) => api.post(`/rooms/${roomId}/invite`)
export const removeMember = (roomId, userId) => api.delete(`/rooms/${roomId}/members/${userId}`)