
<script setup>
    import { onMounted, watch } from 'vue';
    import usePaginatedTable from '@/composables/usePaginatedTable';
    import { fetchMethod } from '@/assets/utils/apis/ordersAPI';
    import TableWithPagination from '@/components/Table.vue';

    const props = defineProps({
      startDate: String,
      endDate: String
    });

    const columns = [
  {
    key: 'g_number',
    title: 'Номер заказа',
    formatter: (value) => value
  },
  {
    key: 'date',
    title: 'Дата заказа',
    formatter: (value) => value ? new Date(value).toLocaleString('ru-RU') : ''
  },
  {
    key: 'supplier_article',
    title: 'Артикул поставщика',
  },
  {
    key: 'nm_id',
    title: 'Артикул WB',
    formatter: (value) => value?.toString()
  },
  {
    key: 'tech_size',
    title: 'Размер'
  },
  {
    key: 'barcode',
    title: 'Штрихкод',
    formatter: (value) => value ? String(value).replace(/(\d{4})(\d{4})/, '$1 $2') : ''
  },
  {
    key: 'total_price',
    title: 'Сумма',
    formatter: (value) => value ? `${parseFloat(value).toLocaleString('ru-RU')}` : ''
  },
  {
    key: 'discount_percent',
    title: 'Скидка',
    formatter: (value) => value ? `${value}` : ''
  },
  {
    key: 'warehouse_name',
    title: 'Склад'
  },
  {
    key: 'oblast',
    title: 'Регион'
  },
  {
    key: 'subject',
    title: 'Предмет'
  },
  {
    key: 'category',
    title: 'Категория'
  },
  {
    key: 'brand',
    title: 'Бренд'
  },
  {
    key: 'is_cancel',
    title: 'Отменён',
    formatter: (value) => value ? 'Да' : 'Нет',
  },
  {
    key: 'income_id',
    title: 'ID поставки',
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