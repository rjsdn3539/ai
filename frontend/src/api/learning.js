import api from './axios'

export const generateProblems = (body) =>
  api.post('/api/learning/generate', body)

export const submitAttempt = (body) =>
  api.post('/api/learning/attempts', body)

export const getLearningStats = () =>
  api.get('/api/learning/stats')

export const generatePlacementProblems = (count = 20) =>
  api.post('/api/learning/placement/generate', { count })

export const getHint = (body) =>
  api.post('/api/learning/hint', body)
