import api from './axios'

export const getMySubscription = () => api.get('/api/v1/subscription/my')

export const upgradeSubscription = (tier, billing) =>
  api.post('/api/v1/subscription/upgrade', { tier, billing })
