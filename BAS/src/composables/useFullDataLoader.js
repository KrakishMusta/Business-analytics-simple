// composables/useFullDataLoader.js
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { debounce } from 'lodash'
import { useTableStore } from '@/stores/tableStore'

// Обертка для debounce, которая возвращает Promise
function debounceAsync(fn, wait) {
  let timeout
  return (...args) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }, wait)
    })
  }
}

export default function useFullDataLoader(apiFunction, tableName = 'default') {
  const store = useTableStore()

  const isLoading = ref(false)
  const error = ref(null)
  const progress = ref(0)
  const isLoaded = ref(false)
  const isCancelled = ref(false)

  const _loadAllData = async (params = {}) => {
    try {
      isLoading.value = true
      error.value = null

      isCancelled.value = false
      store.setAllData(tableName, [])

      const storedDates = useStorage('dates', { start: '', end: '' })

      const requestParams = {
        ...params,
        dateFrom: storedDates.value.start || '',
        dateTo: storedDates.value.end || '',
        limit: 500
      }

      const firstResponse = await apiFunction({ ...requestParams, page: 1 })
      console.log('Первый запрос для проверки', tableName, firstResponse)
      if (!firstResponse.data || !firstResponse.data.meta) throw new Error('Invalid API response structure')

      const totalPages = firstResponse.data.meta.last_page;
      let allLoadedData = firstResponse.data.data;
      store.setAllData(tableName, [...allLoadedData])
      progress.value = (1 / totalPages) * 100

      for (let page = 2; page <= totalPages; page++) {
        if (isCancelled.value) break;
        await new Promise(r => setTimeout(r, 100))
        try {
          const response = await apiFunction({ ...requestParams, page })
          if (response.data && Array.isArray(response.data.data)) {
            allLoadedData = [...allLoadedData, ...response.data.data];
            console.log(`allLoadedData ${page}`, allLoadedData)
            store.setAllData(tableName, [...allLoadedData]);
            progress.value = (page / totalPages) * 100
          }
        } 
        catch (err) {
          console.error('err', err)
          if (err.response && err.response.status === 429) {
            console.error('429')
            await new Promise(r => setTimeout(r, 2000))
            try {
              const retry = await apiFunction({ ...requestParams, page })
              if (retry.data && Array.isArray(retry.data.data)) {
                allLoadedData = [...allLoadedData, ...retry.data.data];
                store.setAllData(tableName, [...allLoadedData]);
                progress.value = (page / totalPages) * 100
              }
            } catch { /* skip */ }
          }
        }
      }
      const finalData = store.tables[tableName]?.allData || []
      console.log('Всего загружено записей:', finalData)

      isLoaded.value = true

      return allLoadedData;
    } catch (err) {
      console.error('Ошибка в loadAllData',err)
      error.value = err.message
      throw err;
    } finally {
      isLoading.value = false;
      // progress.value = 0;
    }
  }

  const loadAllData = debounceAsync(_loadAllData, 300)

  
  const applyFilters = (filters) => {
    const table = store.tables[tableName]
    if (!table || !Array.isArray(table.allData)) return

    const all = table.allData
    console.log('all', all)
    const filtered = all.filter(item =>
      Object.keys(filters).every(fieldKey => {
        const fieldFilters = filters[fieldKey];
        if (!fieldFilters || fieldFilters.filterItems.length === 0) return true;
        return fieldFilters.filterItems.some(filter =>
          String(item[fieldKey] ?? '').toLowerCase() === filter.text.toLowerCase()
        );
      })
    );
    console.log('filtered', filtered)

    const perPage = 20
    const total = filtered.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const pages = Array.from({ length: lastPage }, (_, i) => {
      const start = i * perPage
      return {
        data: filtered.slice(start, start + perPage),
        meta: { current_page: i + 1, per_page: perPage, total, last_page: lastPage }
      }
    })

    store.setFilteredPages(tableName, pages)
  }

  const clearData = (isAfterLoading = true) => {
      console.log('Очистка данных', isAfterLoading ? 'после загрузки' : 'принудительная');
      if (!isAfterLoading) {
          store.clear(tableName);
      }
      progress.value = 0;
      isLoading.value = false;
      isLoaded.value = false;
      error.value = null;
  }

  const cancelLoading = () => {
    isCancelled.value = true
    isLoading.value = false
    progress.value = 0
  }

  return {
    allData: computed(() => store.tables[tableName]?.allData || []),
    filteredPages: computed(() => store.tables[tableName]?.filteredPaginatingData || []),
    applyFilters,
    isLoading,
    error,
    progress,
    isLoaded,
    loadAllData,
    clearData,
    cancelLoading
  }
}