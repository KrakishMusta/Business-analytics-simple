// composables/useFullDataLoader.js
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { debounce } from 'lodash';

export default function useFullDataLoader(apiFunction, storageKey = 'fullData') {
  const allData = useStorage(storageKey, []);
  const isLoading = ref(false);
  const error = ref(null);
  const progress = ref(0);
  const isLoaded = ref(false);

  const loadAllData = debounce(async (params = {}) => {
    try {
      isLoading.value = true;
      error.value = null;
      allData.value = [];
      
      // Загружаем первую страницу, чтобы узнать общее количество страниц
      const firstPageParams = { ...params, page: 1 };
      const firstResponse = await apiFunction(firstPageParams);
      
      if (!firstResponse.data || !firstResponse.data.meta) {
        throw new Error('Invalid API response structure');
      }
      
      const totalPages = firstResponse.data.meta.last_page;
      allData.value = [...firstResponse.data.data];
      progress.value = (1 / totalPages) * 100;
      
      // Загружаем остальные страницы параллельно
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          apiFunction({ ...params, page })
            .then(response => {
              if (response.data && Array.isArray(response.data.data)) {
                allData.value = [...allData.value, ...response.data.data];
                progress.value = (page / totalPages) * 100;
              }
            })
            .catch(err => {
              console.error(`Error loading page ${page}:`, err);
              // Продолжаем загрузку остальных страниц даже если одна не загрузилась
            })
        );
      }
      
      await Promise.all(pagePromises);
      isLoaded.value = true;
    } catch (err) {
      console.error('Error loading all data:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }, 300);

  const clearData = () => {
    allData.value = [];
    isLoaded.value = false;
    progress.value = 0;
  };

  return {
    allData: computed(() => allData.value),
    isLoading,
    error,
    progress,
    isLoaded,
    loadAllData,
    clearData
  };
}