import { ref, computed } from 'vue'

export default function usePaginatedTable(apiFunction) {
  const tableData = ref([])
  // const originalData = ref([])
  // const sortedData = ref([])
  const loading = ref(false)
  const error = ref(null)
  const sortField = ref(null)
  const sortDirection = ref('asc')
  
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    links: []
  })

  // const paginatedData = computed(() => {
  //   const start = (pagination.value.current_page - 1) * pagination.value.per_page
  //   const end = start + pagination.value.per_page
  //   console.log(sortedData.value.slice(start, end), sortedData)
  //   return sortedData.value.slice(start, end)
  // })

  const fetchData = async (page = 1) => {
    console.log('Fetching page:', page);
    try {
      loading.value = true
      const response = await apiFunction({ page })
      tableData.value = [...response.data];
      
      pagination.value = {
        current_page: response.meta.current_page,
        per_page: parseInt(response.meta.per_page),
        total: response.meta.total,
        last_page: response.meta.last_page,
        links: response.meta.links
      }
      if (sortField.value) {
        applySort(sortField.value, sortDirection.value)
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const applySort = (field, direction) => {
    tableData.value.sort((a, b) => {
      let valueA = a[field]
      let valueB = b[field]
      
      if (valueA == null || valueA === '') return 1
      if (valueB == null || valueB === '') return -1
      
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = parseFloat(valueA)
        valueB = parseFloat(valueB)
        return direction === 'asc' ? valueA - valueB : valueB - valueA
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA)
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' 
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime()
      }
      
      return 0
    })
  }

  const sort = (field) => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
    
    applySort(sortField.value, sortDirection.value)
  }

  return {
    data: tableData,
    loading,
    error,
    pagination,
    sortField,
    sortDirection,
    fetchData,
    sort
  }
}