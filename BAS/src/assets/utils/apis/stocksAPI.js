import api from "./api"

export const fetchStocks = async (params) => {
  const response = await api.get('/stocks', { params })
  return response.data
}