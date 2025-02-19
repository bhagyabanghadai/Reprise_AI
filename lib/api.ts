import axios from 'axios'

export const api = axios.create({
  baseURL: '/api', // adjust this based on your API base URL
  withCredentials: true
}) 