import api from './api'

export interface AuthUser {
  id: number
  phone: string
  name: string
  role: string
  learning_center_id: number
  coins: number
}

export interface SendCodeRequest {
  phone: string
  learning_center_id: number
}

export interface VerifyCodeRequest {
  phone: string
  code: string
  learning_center_id: number
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export interface SendCodeResponse {
  message: string
}

export const authApi = {
  sendCode: async (request: SendCodeRequest): Promise<SendCodeResponse> => {
    const response = await api.post<SendCodeResponse>('/api/v1/auth/send-code', request)
    return response.data
  },

  verifyLogin: async (request: VerifyCodeRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/verify-login', request)
    return response.data
  },

  // Verify token (optional - if backend supports it)
  verifyToken: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/api/v1/auth/verify')
    return response.data
  },

  // Logout (if backend supports it)
  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout')
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    })
    return response.data
  },
}