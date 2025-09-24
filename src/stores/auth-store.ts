import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'admin_access_token'
const REFRESH_TOKEN = 'admin_refresh_token'
const USER_DATA = 'admin_user_data'
const PHONE_RETRY_COUNT = 'phone_retry_count'
const PHONE_RETRY_TIMESTAMP = 'phone_retry_timestamp'

interface AuthUser {
  id: number
  phone: string
  name: string
  role: string
  learning_center_id: number
  coins: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    refreshToken: string
    setTokens: (accessToken: string, refreshToken: string) => void
    resetTokens: () => void
    reset: () => void
  }
  phoneVerification: {
    retryCount: number
    lastAttemptTime: number
    setRetryCount: (count: number) => void
    setLastAttemptTime: (timestamp: number) => void
    incrementRetryCount: () => void
    clearRetryData: () => void
    getWaitTime: () => number
    canRetry: () => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const accessTokenCookie = getCookie(ACCESS_TOKEN)
  const refreshTokenCookie = getCookie(REFRESH_TOKEN)
  const userCookie = getCookie(USER_DATA)
  const retryCountCookie = getCookie(PHONE_RETRY_COUNT)
  const retryTimestampCookie = getCookie(PHONE_RETRY_TIMESTAMP)
  
  const initAccessToken = accessTokenCookie ? JSON.parse(accessTokenCookie) : ''
  const initRefreshToken = refreshTokenCookie ? JSON.parse(refreshTokenCookie) : ''
  const initUser = userCookie ? JSON.parse(userCookie) : null
  const initRetryCount = retryCountCookie ? parseInt(retryCountCookie) : 0
  const initRetryTimestamp = retryTimestampCookie ? parseInt(retryTimestampCookie) : 0
  
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(USER_DATA, JSON.stringify(user))
          } else {
            removeCookie(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initAccessToken,
      refreshToken: initRefreshToken,
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken, 
              refreshToken 
            } 
          }
        }),
      resetTokens: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken: '', 
              refreshToken: '' 
            } 
          }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          removeCookie(USER_DATA)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              accessToken: '', 
              refreshToken: '' 
            },
          }
        }),
    },
    phoneVerification: {
      retryCount: initRetryCount,
      lastAttemptTime: initRetryTimestamp,
      setRetryCount: (count) =>
        set((state) => {
          setCookie(PHONE_RETRY_COUNT, count.toString())
          return {
            ...state,
            phoneVerification: { ...state.phoneVerification, retryCount: count }
          }
        }),
      setLastAttemptTime: (timestamp) =>
        set((state) => {
          setCookie(PHONE_RETRY_TIMESTAMP, timestamp.toString())
          return {
            ...state,
            phoneVerification: { ...state.phoneVerification, lastAttemptTime: timestamp }
          }
        }),
      incrementRetryCount: () =>
        set((state) => {
          const newCount = state.phoneVerification.retryCount + 1
          const timestamp = Date.now()
          setCookie(PHONE_RETRY_COUNT, newCount.toString())
          setCookie(PHONE_RETRY_TIMESTAMP, timestamp.toString())
          return {
            ...state,
            phoneVerification: {
              ...state.phoneVerification,
              retryCount: newCount,
              lastAttemptTime: timestamp
            }
          }
        }),
      clearRetryData: () =>
        set((state) => {
          removeCookie(PHONE_RETRY_COUNT)
          removeCookie(PHONE_RETRY_TIMESTAMP)
          return {
            ...state,
            phoneVerification: {
              ...state.phoneVerification,
              retryCount: 0,
              lastAttemptTime: 0
            }
          }
        }),
      getWaitTime: () => {
        const { retryCount, lastAttemptTime } = get().phoneVerification
        const baseWaitTime = 60000 // 1 minute in milliseconds
        const waitTime = baseWaitTime * retryCount
        const timePassed = Date.now() - lastAttemptTime
        return Math.max(0, waitTime - timePassed)
      },
      canRetry: () => {
        const waitTime = get().phoneVerification.getWaitTime()
        return waitTime === 0
      }
    },
  }
})
