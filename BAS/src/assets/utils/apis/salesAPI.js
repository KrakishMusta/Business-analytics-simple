import api from "./api"

export const fetchStocks = async (params) => {
  const response = await api.get('/sales', { params })
  return response.data
}