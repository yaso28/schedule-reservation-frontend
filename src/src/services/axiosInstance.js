import axios from 'axios'

export default axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 20000,
  withCredentials: true
})
