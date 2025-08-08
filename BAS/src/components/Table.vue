<script setup>
    const props = defineProps({
        data: Array,
        loading: Boolean,
        error: [String, null],
        pagination: Object,
        sortField: [String, null],
        sortDirection: String,
        columns: Array
    })

    const emit = defineEmits(['page-change', 'sort'])

    const handlePageChange = (url) => {
        if (!url) return
        const page = new URL(url).searchParams.get('page')
        emit('page-change', parseInt(page))
    }

    const isNumeric = (value) => {
        if (value === null || value === undefined) return false;
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    const formatValue = (value, column) => {
        if (column.formatter) {
            return column.formatter(value)
        }
        return value === null || value === undefined ? '' : value
    }

    const sort = (field) => {
        emit('sort', field)
    }
</script>

<template>
  <div>
    <div class="table-container">
      <table class="table-auto text-cyan-950 py-6">
        <thead class="w-[100%] h-8 cursor-default">
          <tr class="table-row">
            <th
              class="table-cell-custom"
              v-for="column in columns" 
              :key="column.key"
              @click="sort(column.key)"
            >
              {{ column.title }}
              <span v-if="sortField === column.key">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- {{ data }} -->
          <tr class="table-row" v-for="(item, index) in data" :key="`${item.nm_id}_${index}`">
            <td :class="{ 'text-center': isNumeric(item[column.key]), 'table-cell-custom': true }" v-for="column in columns" :key="column.key">
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
  </div>
</template>
<style lang="css" scoped>
    @import "tailwindcss";

    @layer components {
        .table-cell-custom {
            @apply box-border px-6 align-middle text-nowrap;
        }
        .table-container {
            @apply w-full overflow-x-scroll flex max-w-fit flex-col gap-8;
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