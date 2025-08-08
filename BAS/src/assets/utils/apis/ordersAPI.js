import api from "./api"

export const fetchMethod = async (params) => {
  const response = await api.get('/orders', { params })
  return response
}