import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'

let { 'nextauth.token': token } = parseCookies()

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${token}`
  }
})

api.interceptors.response.use(response => {
  return response
}, (error: AxiosError) => {
  if(error.response?.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      //renovar o token
      
      const { 'nextauth.refreshToken': refreshToken } = parseCookies()

      api.post('/refresh', {
        refreshToken,
      }).then(response => {
        const { token } = response.data

        setCookie(undefined, 'nextauth.token', token, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })

        setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })

        api.defaults.headers['Authorization'] = `Bearer ${token}`
      })
    } else {
      //deslogar user
    }
  }
})