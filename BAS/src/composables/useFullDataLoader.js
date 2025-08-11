// composables/useFullDataLoader.js
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { debounce } from 'lodash';

export default function useFullDataLoader(apiFunction, storageKey = 'fullData') {
  console.log('=== ИНИЦИАЛИЗАЦИЯ useFullDataLoader ===');
  console.log('Storage key:', storageKey);
  
  const allData = useStorage(storageKey, []);
  const filteredData = useStorage(`${storageKey}-filtered-data`, {
    data: [],
    meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 }
  });
  
  console.log('Данные загружены из localStorage:', {
    allDataLength: allData.value.length,
    filteredDataLength: filteredData.value.data.length,
    storageKey
  });
  
  const isLoading = ref(false);
  const error = ref(null);
  const progress = ref(0);
  const isLoaded = ref(false);
  const isCancelled = ref(false);

  const loadAllData = debounce(async (params = {}) => {
    try {
      console.log('=== НАЧАЛО ЗАГРУЗКИ ВСЕХ ДАННЫХ ===');
      console.log('Параметры загрузки:', params);
      
      isLoading.value = true;
      error.value = null;
      isCancelled.value = false;
      allData.value = [];
      
      // Получаем даты из localStorage
      const storedDates = useStorage('dates', { start: '', end: '' });
      console.log('Даты из localStorage:', storedDates.value);
      
      // Формируем параметры как в usePaginatedTable, добавляем limit: 500
      const requestParams = {
        ...params,
        dateFrom: storedDates.value.start || '',
        dateTo: storedDates.value.end || '',
        limit: 500
      };
      
      console.log('Финальные параметры запроса:', requestParams);
      
      // Загружаем первую страницу, чтобы узнать общее количество страниц
      console.log('Загружаем первую страницу для получения метаданных...');
      const firstPageParams = { ...requestParams, page: 1 };
      const firstResponse = await apiFunction(firstPageParams);
      
      if (!firstResponse.data || !firstResponse.data.meta) {
        throw new Error('Invalid API response structure');
      }
      
      const totalPages = firstResponse.data.meta.last_page;
      console.log('Метаданные получены:', firstResponse.data.meta);
      console.log('Общее количество страниц:', totalPages);
      console.log('Записей на первой странице:', firstResponse.data.data.length);
      
      allData.value = [...firstResponse.data.data];
      progress.value = (1 / totalPages) * 100;
      console.log('Прогресс после первой страницы:', progress.value + '%');
      
      // Загружаем остальные страницы последовательно с задержкой
      console.log('Начинаем загрузку остальных страниц...');
      for (let page = 2; page <= totalPages; page++) {
        // Проверяем, не была ли загрузка отменена
        if (isCancelled.value) {
          console.log('Загрузка данных отменена пользователем');
          break;
        }
        
        try {
          console.log(`Загружаем страницу ${page}/${totalPages}...`);
          
          // Добавляем задержку между запросами (100ms)
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const response = await apiFunction({ ...requestParams, page });
          
          if (response.data && Array.isArray(response.data.data)) {
            allData.value = [...allData.value, ...response.data.data];
            progress.value = (page / totalPages) * 100;
            console.log(`Страница ${page} загружена. Записей: ${response.data.data.length}. Прогресс: ${progress.value.toFixed(1)}%`);
          }
        } catch (err) {
          console.error(`Ошибка загрузки страницы ${page}:`, err);
          
          // Если получили 429 (Too Many Requests), увеличиваем задержку
          if (err.response && err.response.status === 429) {
            console.log('Достигнут лимит запросов, ждем 2 секунды...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Пробуем еще раз
            try {
              console.log(`Повторная попытка загрузки страницы ${page}...`);
              const retryResponse = await apiFunction({ ...requestParams, page });
              if (retryResponse.data && Array.isArray(retryResponse.data.data)) {
                allData.value = [...allData.value, ...retryResponse.data.data];
                progress.value = (page / totalPages) * 100;
                console.log(`Страница ${page} загружена после повторной попытки. Записей: ${retryResponse.data.data.length}`);
              }
            } catch (retryErr) {
              console.error(`Повторная попытка для страницы ${page} не удалась:`, retryErr);
              // Пропускаем эту страницу и продолжаем
            }
          }
          // Продолжаем загрузку остальных страниц даже если одна не загрузилась
        }
      }
      isLoaded.value = true;
      console.log('=== ЗАГРУЗКА ВСЕХ ДАННЫХ ЗАВЕРШЕНА ===');
      console.log('Общее количество загруженных записей:', allData.value.length);
      console.log('Финальный прогресс:', progress.value + '%');
    } catch (err) {
      console.error('Ошибка загрузки всех данных:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
      console.log('Состояние загрузки установлено в false');
    }
  }, 300);

  const applyFilters = (filters) => {
    console.log('=== НАЧАЛО ПРИМЕНЕНИЯ ФИЛЬТРОВ ===');
    console.log('Storage key:', storageKey);
    console.log('Количество записей для фильтрации:', allData.value?.length || 0);
    console.log('Источник данных: localStorage (useStorage)');
    console.log('Применяемые фильтры:', filters);
    
    if (!allData.value || allData.value.length === 0) {
      console.log('Нет данных для фильтрации');
      return;
    }
    
    const filtered = allData.value.filter(item => {
      return Object.keys(filters).every(fieldKey => {
        const fieldFilters = filters[fieldKey];
        if (!fieldFilters || fieldFilters.filterItems.length === 0) return true;
        
        return fieldFilters.filterItems.some(filter => {
          const itemValue = String(item[fieldKey] || '');
          const matches = itemValue.toLowerCase().includes(filter.text.toLowerCase());
          return matches;
        });
      });
    });
    
    console.log('Количество записей после фильтрации:', filtered.length);
    
    filteredData.value = {
      data: filtered,
      meta: {
        current_page: 1,
        per_page: 20,
        total: filtered.length,
        last_page: Math.ceil(filtered.length / 20)
      }
    };
    
    console.log('Метаданные отфильтрованных данных:', filteredData.value.meta);
    console.log('=== ПРИМЕНЕНИЕ ФИЛЬТРОВ ЗАВЕРШЕНО ===');
  };

  const clearData = () => {
    console.log('=== ОЧИСТКА ДАННЫХ ===');
    console.log('Storage key:', storageKey);
    console.log('Количество записей до очистки:', allData.value.length);
    
    allData.value = [];
    isLoaded.value = false;
    progress.value = 0;
    
    console.log('Данные очищены из localStorage');
  };

  const cancelLoading = () => {
    isCancelled.value = true;
    isLoading.value = false;
  };

  return {
    allData: computed(() => allData.value),
    filteredData: computed(() => filteredData.value),
    applyFilters,
    isLoading,
    error,
    progress,
    isLoaded,
    loadAllData,
    clearData,
    cancelLoading
  };
}