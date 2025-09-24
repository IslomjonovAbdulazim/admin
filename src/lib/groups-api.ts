import { api } from './api'

export interface Group {
  id: number
  name: string
  course_id: number
  teacher_id: number
  student_count: number
  created_at: string
}

export interface CreateGroupData {
  name: string
  course_id: number
  teacher_id: number
}

export interface UpdateGroupData {
  name?: string
  course_id?: number
  teacher_id?: number
}

export interface AddStudentData {
  student_id: number
}

export interface ListGroupsParams {
  skip?: number
  limit?: number
}

export const groupsApi = {
  list: async (params: ListGroupsParams = {}): Promise<Group[]> => {
    const response = await api.get<Group[]>('/api/v1/admin/groups', { 
      params: { skip: 0, limit: 100, ...params }
    })
    return response.data
  },

  get: async (id: number): Promise<Group> => {
    const response = await api.get<Group>(`/api/v1/admin/groups/${id}`)
    return response.data
  },

  create: async (data: CreateGroupData): Promise<Group> => {
    const response = await api.post<Group>('/api/v1/admin/groups', data)
    return response.data
  },

  update: async (id: number, data: UpdateGroupData): Promise<Group> => {
    const response = await api.put<Group>(`/api/v1/admin/groups/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/groups/${id}`)
  },

  addStudent: async (groupId: number, data: AddStudentData): Promise<void> => {
    await api.post(`/api/v1/admin/groups/${groupId}/students`, data)
  },

  removeStudent: async (groupId: number, studentId: number): Promise<void> => {
    await api.delete(`/api/v1/admin/groups/${groupId}/students/${studentId}`)
  },
}