import api from './api'

// Types for User Management API
export interface User {
  id: number
  phone: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  coins: number
  is_active: boolean
  created_at: string
}

export interface CreateUserRequest {
  phone: string
  name: string
  role: 'teacher' | 'student' // Only these roles can be created by admin
}

export interface UpdateUserRequest {
  phone: string
  name: string
  role: 'teacher' | 'student' // Cannot change role to admin
}

export interface ListUsersParams {
  role?: 'admin' | 'teacher' | 'student'
  skip?: number
  limit?: number
}

export interface DeleteResponse {
  message: string
}

// User Management API functions
export const usersApi = {
  // List all users with filters
  list: async (params?: ListUsersParams): Promise<User[]> => {
    const searchParams = new URLSearchParams()
    if (params?.role !== undefined) 
      searchParams.set('role', params.role)
    if (params?.skip !== undefined) 
      searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) 
      searchParams.set('limit', params.limit.toString())
    
    const url = `/api/v1/admin/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<User[]>(url)
    return response.data
  },

  // Get specific user
  get: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/v1/admin/users/${id}`)
    return response.data
  },

  // Create new user (teacher/student only)
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/api/v1/admin/users', data)
    return response.data
  },

  // Update user (cannot change role to admin)
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/api/v1/admin/users/${id}`, data)
    return response.data
  },

  // Soft delete user
  delete: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(`/api/v1/admin/users/${id}`)
    return response.data
  },
}