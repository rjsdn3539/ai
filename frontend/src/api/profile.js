import api from './axios'

export const getResumes = () => api.get('/api/v1/profiles/resumes')
export const getCoverLetters = () => api.get('/api/v1/profiles/cover-letters')
export const getJobPostings = () => api.get('/api/v1/profiles/job-postings')

export const createResume = (body) => api.post('/api/v1/profiles/resumes', body)
export const createCoverLetter = (body) => api.post('/api/v1/profiles/cover-letters', body)
export const createJobPosting = (body) => api.post('/api/v1/profiles/job-postings', body)
