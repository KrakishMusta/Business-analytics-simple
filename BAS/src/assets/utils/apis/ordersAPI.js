import api from "./api"

export const fetchStocks = async (params) => {
  const response = await api.get('/orders', { params })
  return response.data
}