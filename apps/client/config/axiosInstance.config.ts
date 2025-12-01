import axios, { AxiosInstance } from 'axios'
import Cookies from 'js-cookie'

const extractAccessToken = () => {
  const cookies = Cookies.get()

  if (cookies) {
    const cookieKey = Object.keys(cookies)?.find((name) => name?.includes('accessToken'))
    return cookieKey ? cookies?.[cookieKey] : null
  }
}

const axiosClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    try {
      const accessToken = extractAccessToken()
      if (accessToken) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      }
    } catch (error) {
      console.error('Error setting auth token:', error)
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

axiosClient.defaults.timeout = 45000

axiosClient.defaults.withCredentials = true

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error?.status == 401) {
      // TODO: Implement logout user
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default axiosClient
