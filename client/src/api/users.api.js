import api from './axios'

export const updateProfile = (data) => api.put('/users/profile', data)
export const changePassword = (data) => api.put('/users/password', data)

// Avatar upload — send as FormData so the file goes as multipart
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return api.post('/users/avatar', formData)
}

// Username availability check (debounced on client)
export const checkUsername = (username) =>
  api.get('/users/check-username', { params: { username } })
