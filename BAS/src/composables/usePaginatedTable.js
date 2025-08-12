import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'lodash';
import { useTableStore } from '@/stores/tableStore';

export default function usePaginatedTable(apiFunction, options = {}) {
  console.log('usePaginatedTable', options)
  const dataSource = ref(options.source === 'client' ? 'client' : 'server');
  const route = useRoute();
  const tableName = computed(() => route.name);
  const serverLimit = typeof options.limit === 'number' ? options.limit : 20;

  const storedTableState = useStorage('table_state', {
    data: [],
    pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1, links: [] }
  });

  const tableData = computed({
    get: () => storedTableState.value.data,
    set: (value) => {
      storedTableState.value.data = value;
    }
  });

  const pagination = computed({
    get: () => storedTableState.value.pagination,
    set: (value) => {
      storedTableState.value.pagination = {
        current_page: value.current_page || 1,
        per_page: parseInt(value.per_page) || 20,
        total: value.total || 0,
        last_page: value.last_page || 1,
        links: Array.isArray(value.links) ? value.links : []
      };
    }
  });

  const loading = ref(false);
  const error = ref(null);

  const storedDates = useStorage('dates', { start: '', end: '' });
  const filtersStorage = useStorage('business-analytics-filters', {});
  const store = useTableStore();
  const prefetchInProgress = ref(false);

  const hasActiveFilters = () => {
    // Эта строка проверяет, есть ли хотя бы один фильтр с непустым массивом filterItems:
    // 1. filtersStorage.value || {} — получаем объект фильтров из локального хранилища, если его нет, используем пустой объект.
    // 2. Object.values(filters) — получаем массив всех значений (объектов фильтров).
    // 3. some(...) — возвращает true, если хотя бы для одного фильтра выполняется условие:
    //    - Array.isArray(f?.filterItems) — filterItems существует и это массив.
    //    - f.filterItems.length > 0 — массив не пустой.
    const filters = filtersStorage.value || {};
    return Object.values(filters).some(f => Array.isArray(f?.filterItems) && f.filterItems.length > 0);
  };

  const prefetchAllDataToStore = async (totalPages) => {
    console.log('prefetchAllDataToStore', tableName.value, totalPages)
    const pagesForAll = Math.ceil(totalPages * serverLimit / 500);
    if (prefetchInProgress.value) return;
    prefetchInProgress.value = true;
    try {
      store.ensureTable(tableName);
      store.setAllData(tableName, []);
      for (let page = 1; page <= pagesForAll; page++) {
        try {
          const resp = await apiFunction({
            page,
            limit: 500,
            dateFrom: storedDates.value.start || '',
            dateTo: storedDates.value.end || ''
          });
          console.log('Запрос', page)

          if (resp?.data?.data && Array.isArray(resp.data.data)) {
            const current = store.tables[tableName]?.allData || [];
            store.setAllData(tableName, [...current, ...resp.data.data]);
          }
        } catch (_e) {
          // игнорируем ошибки отдельных страниц
        }
      }
    } finally {
      prefetchInProgress.value = false;
    }
  };

  const fetchData = debounce(async (page = 1) => {
    try {
      loading.value = true;

      if (dataSource.value === 'server') {
        const params = {
          page,
          limit: serverLimit,
          dateFrom: storedDates.value.start || '',
          dateTo: storedDates.value.end || ''
        };
        const response = await apiFunction(params);

        if (response.data && 'data' in response.data && 'meta' in response.data) {
          tableData.value = response.data.data;
          const meta = response.data.meta || {};
          const totalPages = Number(meta.last_page) || 1;
          const currentPage = Number(meta.current_page) || 1;
          const links = Array.isArray(meta.links) && meta.links.length > 0
            ? meta.links
            : Array.from({ length: totalPages }, (_, i) => ({
                label: String(i + 1),
                url: `?page=${i + 1}`,
                active: i + 1 === currentPage
              }));
          pagination.value = {
            current_page: currentPage,
            per_page: meta.per_page,
            total: meta.total,
            last_page: totalPages,
            links
          };
          error.value = response.data.data.length === 0 ? 'Нет записей с текущими фильтрами даты.' : null;

          // Если фильтров нет — используем серверную пагинацию, но параллельно загружаем все данные в Pinia
          console.log('Наличие фильтров',hasActiveFilters())
          if (hasActiveFilters() && !(store.tables[tableName]?.allData?.length)) {
            prefetchAllDataToStore(totalPages);
          }
        } else {
          tableData.value = [];
          error.value = 'Некорректная структура ответа от API.';
        }
      } 
      else {
        // CLIENT: читаем страницы из Pinia
        console.log('CLIENT: читаем страницы из Pinia', tableName.value)
        store.ensureTable(tableName.value);
        const pages = store.tables[tableName.value].filteredPaginatingData || [];
        console.log('pages', pages)
        const lastPage = Math.max(1, pages.length || 1);
        const safePage = Math.min(Math.max(1, parseInt(page) || 1), lastPage);
        const pageObj = pages[safePage - 1] || {
          data: [],
          meta: {
            current_page: safePage,
            per_page: 20,
            total: 0,
            last_page: lastPage,
            path: `/api/${tableName.value}`
          }
        };

        console.log('pageObj', pageObj)

        tableData.value = pageObj.data;

        const perPage = pageObj.meta?.per_page || 20;
        const total = pages[0]?.meta?.total ?? pageObj.meta?.total ?? 0;
        const path = pageObj.meta?.path || `/api/${tableName.value}`;

        // Генерация ссылок в Laravel-формате
        const links = [];

        // Previous
        links.push({
          url: safePage > 1 ? `${path}?page=${safePage - 1}` : null,
          label: "&laquo; Previous",
          active: false
        });

        // Страницы с сокращением (…)
        const range = 3; // сколько страниц вокруг текущей
        for (let i = 1; i <= lastPage; i++) {
          if (i === 1 || i === 2 || i === lastPage || i === lastPage - 1 || (i >= safePage - range && i <= safePage + range)) {
            links.push({
              url: `${path}?page=${i}`,
              label: String(i),
              active: i === safePage
            });
          } 
          else if (
            (i === safePage - range - 2 && i > 1) ||
            (i === safePage + range + 2 && i < lastPage)
          ) 
          {
            links.push({
              url: null,
              label: "...",
              active: false
            });
          }
        }

        // Next
        links.push({
          url: safePage < lastPage ? `${path}?page=${safePage + 1}` : null,
          label: "Next &raquo;",
          active: false
        });

        pagination.value = {
          current_page: safePage,
          per_page: perPage,
          total,
          last_page: lastPage,
          links
        };

        error.value = total === 0 ? 'Нет записей, соответствующих фильтрам.' : null;

      }
    } 
    catch (err) {
      error.value = err.message;
    } 
    finally {
      loading.value = false;
    }
  }, 300);

  const setSource = (source) => {
    dataSource.value = source === 'client' ? 'client' : 'server';
  };
  const source = computed(() => dataSource.value);

  return {
    loading,
    error,
    pagination,
    fetchData,
    setSource,
    source
  };
}