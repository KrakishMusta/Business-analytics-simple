
<script setup>
    import { onMounted, watch } from 'vue';
    import usePaginatedTable from '@/composables/usePaginatedTable';
    import { fetchMethod } from '@/assets/utils/apis/incomesAPI';
    import TableWithPagination from '@/components/Table.vue';

    const props = defineProps({
      startDate: String,
      endDate: String
    });

    const columns = [
        {
            key: 'income_id',
            title: 'ID поставки',
            formatter: (value) => value || ''
        },
        {
            key: 'date',
            title: 'Дата',
            formatter: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : ''
        },
        {
            key: 'last_change_date',
            title: 'Дата изменения',
            formatter: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : ''
        },
        {
            key: 'supplier_article',
            title: 'Артикул поставщика'
        },
        {
            key: 'tech_size',
            title: 'Размер'
        },
        {
            key: 'barcode',
            title: 'Штрихкод',
            formatter: (value) => value ? String(value) : ''
        },
        {
            key: 'quantity',
            title: 'Количество',
            formatter: (value) => value?.toString() || '0'
        },
        {
            key: 'total_price',
            title: 'Сумма',
            formatter: (value) => value ? `${parseFloat(value).toLocaleString('ru-RU')}` : ''
        },
        {
            key: 'date_close',
            title: 'Дата закрытия',
            formatter: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : ''
        },
        {
            key: 'warehouse_name',
            title: 'Склад'
        },
        {
            key: 'nm_id',
            title: 'Артикул WB',
            formatter: (value) => value?.toString() || ''
        }
    ];

    const {
      data: tableData,
      loading,
      error,
      pagination,
      sortField,
      sortDirection,
      fetchData,
      sort
    } = usePaginatedTable(fetchMethod);

    watch([() => props.startDate, () => props.endDate], () => {
      console.log('Отслеживание изменения дат')
      fetchData(1);
    });

    onMounted(() => {
      fetchData();
    });
</script>
<template>
  <TableWithPagination
    :data="tableData"
    :loading="loading"
    :error="error"
    :pagination="pagination"
    :sort-field="sortField"
    :sort-direction="sortDirection"
    :columns="columns"
    @page-change="fetchData"
    @sort="sort"
  />
</template>
<style lang="css" scoped>
    
</style>