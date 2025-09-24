import api from './api'

export interface PublicLearningCenter {
  id: number
  name: string
  logo: string | null
}

export const learningCentersPublicApi = {
  list: async (): Promise<PublicLearningCenter[]> => {
    const response = await api.get<PublicLearningCenter[]>('/api/v1/auth/learning-centers')
    return response.data
  },
}