import api from "./api"

export const fetchStocks = async (params) => {
  const response = await api.get('/incomes', { params })
  return response.data
}