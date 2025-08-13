<script setup>
    import { computed, ref, watch, onMounted } from 'vue';
    import svgFilterIcon from './svgFilterIcon.vue'
    import { useStorage } from '@vueuse/core';

    const props = defineProps({
        // data: Array,
        loading: Boolean,
        error: [String, null],
        // pagination: Object,
        sortField: [String, null],
        sortDirection: String,
        columns: Array
    })

    const emit = defineEmits(['page-change', 'sort'])
    
    const columnsViewStorage = useStorage('table-columns-view', {})

    const filters = useStorage('business-analytics-filters', {})

    const visibleColumns = computed(() => {
      return props.columns.filter(column => columnsViewStorage.value[column.key]?.isView !== false)
    })

    function getFilterItems(key) {
      return filters.value[key]?.filterItems ?? []
    }

    const storedTableData = useStorage('table_state', {
      data: [],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        links: []
      }
    });
  
    const tableData = computed({
      get: () => Array.isArray(storedTableData.value?.data) ? storedTableData.value.data : [],
      set: (value) => {
        storedTableData.value.data = value;
      }
    });

    const pagination = computed({
      get: () => {
        const p = storedTableData.value && storedTableData.value.pagination ? storedTableData.value.pagination : undefined;
        return {
          current_page: p?.current_page ?? 1,
          per_page: parseInt(p?.per_page) || 20,
          total: p?.total ?? 0,
          last_page: p?.last_page ?? 1,
          links: Array.isArray(p?.links) ? p.links : []
        };
      },
      set: (value) => {
        storedTableData.value.pagination = {
          current_page: value.current_page || 1,
          per_page: parseInt(value.per_page) || 20,
          total: value.total || 0,
          last_page: value.last_page || 1,
          links: Array.isArray(value.links) ? value.links : []
        };
      }
    });

    const handlePageChange = (url) => {
        if (!url) return
        const page = new URL(url, window.location.href).searchParams.get('page')
        emit('page-change', parseInt(page))
    }

    const isNumeric = (value) => {
        if (value === null || value === undefined) return false;
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    const isDate = (value) => {
      if (!value) return false;
      // Пробуем создать дату — если валидная, вернем true
      const d = new Date(value);
      return !isNaN(d.getTime());
    }

    const formatValue = (value, column) => {
        if (column.formatter) {
            return column.formatter(value)
        }
        return value === null || value === undefined ? '' : value
    }

    const sort = (field) => {
        emit('sort', field)
    }

    onMounted(
      () =>
      {
        console.log('tableData',tableData.value)
      }
    )
</script>

<template>
    <div class="table-container">
      <table class="table-auto text-cyan-950 py-6">
        <thead class="w-[100%] h-8 cursor-default">
          <tr class="table-row">
            <th
              class="table-cell-custom"
              :class="{ 'bg-indigo-200': getFilterItems(column.key).length > 0 }"
              v-for="column in visibleColumns"
              :key="column.key"
            >
              <span
                class="flex items-center"
                :class="getFilterItems(column.key).length > 0 ? 'justify-between gap-2' : 'justify-center'"
              >
                <span>{{ column.title }}</span>

                <span v-if="getFilterItems(column.key).length > 0">
                  <svg-filter-icon />
                </span>
                <span v-if="sortField === column.key">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="table-row" v-for="(item, index) in tableData" :key="`${item.nm_id}_${index}`">
            <td
              :class="{ 'text-center': isNumeric(item[column.key]) || isDate(item[column.key]), 'table-cell-custom': true }"
              v-for="column in visibleColumns"
              :key="column.key"
            >
              {{ formatValue(item[column.key], column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading">Loading...</div>
    <div class=" text-cyan-950 py-4" v-if="error">{{ error }}</div>

    <div class="flex flex-row w-full justify-between mt-6 text-cyan-950">
        <div class="pagination-container">
            <div class="pagination-buttons">
              <button
                  v-for="(link, index) in pagination.links"
                  :key="link.label"
                  :class="[
                  {
                    'w-fit px-3': index === 0 || index === pagination.links.length - 1,
                    'w-8': index > 0 && index < pagination.links.length - 1,
                    'bg-indigo-200 cursor-default bg': link.active,
                    'cursor-pointer hover:bg-indigo-100 disabled:bg-transparent': !link.active
                  },
                    'h-8 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-default'
                  ]"
                  :disabled="!link.url || link.active"
                  @click="handlePageChange(link.url)"
              >
                  <span v-html="link.label"></span>
              </button>
            </div>
        </div>
        <span class=" content-center opacity-50">{{pagination.total}}</span>
    </div>
</template>
<style lang="css" scoped>
    @import "tailwindcss";

    @layer components {
        .table-cell-custom {
            @apply box-border px-6 align-middle text-nowrap;
        }
        .table-container {
            @apply w-full flex flex-col gap-8;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
            /* Стили для скроллбара (опционально) */
        .table-container::-webkit-scrollbar {
            height: 8px;
        }

        .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }


        .pagination-container {
            @apply flex flex-col sm:flex-row justify-between items-center gap-4;
        }

        .pagination-buttons {
            @apply flex flex-wrap justify-center gap-1;
        }

        .pagination-btn {
            @apply w-8 h-8 flex items-center justify-center rounded-full 
                  bg-white border border-gray-300 hover:bg-gray-100 
                  disabled:opacity-50 disabled:cursor-default;
        }
    }
</style>