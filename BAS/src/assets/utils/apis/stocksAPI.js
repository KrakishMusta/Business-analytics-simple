import api from "./api"

export const fetchMethod = async (params) => {
  const response = await api.get('/stocks', { params })
  return response
}