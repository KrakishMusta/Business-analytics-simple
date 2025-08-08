import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { debounce } from 'lodash';

export default function usePaginatedTable(apiFunction) {
  const tableData = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const sortField = ref(null);
  const sortDirection = ref('asc');
  
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    links: []
  });

  const storedDates = useStorage('dates', { start: '', end: '' });

  const fetchData = debounce(async (page = 1) => {
    try {
      loading.value = true;
      console.log('Fetching page:', page);
      console.log('Stored dates:', storedDates.value);
      const params = {
        page: page,
        dateFrom: storedDates.value.start || '',
        dateTo: storedDates.value.end || ''
      };
      console.log('fetchData params:', params);
      const response = await apiFunction(params);
      console.log('API Response:', response);

      if (
        response.data &&
        'data' in response.data &&
        'links' in response.data &&
        'meta' in response.data
      ) {
        console.log('Assigning data:', response.data.data);
        tableData.value = Array.isArray(response.data.data) ? response.data.data : [];
        pagination.value = {
          current_page: response.data.meta.current_page || 1,
          per_page: parseInt(response.data.meta.per_page) || 10,
          total: response.data.meta.total || 0,
          last_page: response.data.meta.last_page || 1,
          links: Array.isArray(response.data.meta.links) ? response.data.meta.links : []
        };
        error.value = response.data.data.length === 0 ? 'Нет записей с текущими фильтрами даты.' : null;
        console.log('Request URL:', `${response.config.url}?${new URLSearchParams(response.config.params).toString()}`);
      } else {
        console.error('Invalid API response structure:', response.data);
        tableData.value = [];
        error.value = 'Некорректная структура ответа от API.';
      }

      if (sortField.value) {
        applySort(sortField.value, sortDirection.value);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
      console.log('Final tableData:', tableData.value);
    }
  }, 300);

  const applySort = (field, direction) => {
    tableData.value.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      if (valueA == null || valueA === '') return 1;
      if (valueB == null || valueB === '') return -1;
      
      if (!isNaN(valueA) && !isNaN(valueB)) {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' 
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      
      return 0;
    });
  };

  const sort = (field) => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortField.value = field;
      sortDirection.value = 'asc';
    }
    
    applySort(sortField.value, sortDirection.value);
  };

  return {
    data: tableData,
    loading,
    error,
    pagination,
    sortField,
    sortDirection,
    fetchData,
    sort
  };
}