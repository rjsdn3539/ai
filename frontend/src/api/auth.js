import api from './axios'

export const login = (email, password) =>
  api.post('/api/v1/auth/login', { email, password })

export const register = (form) =>
  api.post('/api/v1/auth/signup', form)

export const logout = (refreshToken) =>
  api.post('/api/v1/auth/logout', { refreshToken })

export const refreshToken = (token) =>
  api.post('/api/v1/auth/refresh', { refreshToken: token })
