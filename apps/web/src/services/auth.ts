import { api } from './api'

export type User = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type SignupRequest = {
  name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
}

export async function signup(data: SignupRequest): Promise<User> {
  const response = await api.post<User>('/users', data)
  return response.data
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data)
  return response.data
}

export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/auth/profile')
  return response.data
}
