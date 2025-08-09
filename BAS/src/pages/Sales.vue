
<script setup>
    import { onMounted, watch } from 'vue';
    import { fetchMethod } from '@/assets/utils/apis/salesAPI';
    import DataView from '../components/DataView.vue';

    const columns = [
      {
        key: 'g_number',
        title: 'Номер заказа',
        formatter: (value) => value || '',
      },
      {
        key: 'date',
        title: 'Дата заказа',
        formatter: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : '',
      },
      {
        key: 'supplier_article',
        title: 'Артикул поставщика',
      },
      {
        key: 'tech_size',
        title: 'Размер',
      },
      {
        key: 'barcode',
        title: 'Штрихкод',
        formatter: (value) => value ? String(value).replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '',
      },
      {
        key: 'total_price',
        title: 'Общая цена',
        formatter: (value) => value ? `${parseFloat(value).toFixed(2)}` : '',
      },
      {
        key: 'discount_percent',
        title: 'Скидка',
        formatter: (value) => value ? `${value}` : '',
      },
      {
        key: 'warehouse_name',
        title: 'Склад',
      },
      {
        key: 'region_name',
        title: 'Регион',
      },
      {
        key: 'nm_id',
        title: 'Артикул WB',
        formatter: (value) => value?.toString() || '',
      },
      {
        key: 'subject',
        title: 'Предмет',
      },
      {
        key: 'category',
        title: 'Категория',
      },
      {
        key: 'brand',
        title: 'Бренд',
      },
      {
        key: 'finished_price',
        title: 'Финальная цена',
        formatter: (value) => value ? `${parseFloat(value).toFixed(2)}` : '',
      },
      {
        key: 'for_pay',
        title: 'К оплате',
        formatter: (value) => value ? `${parseFloat(value).toFixed(2)}` : '',
      },
      {
        key: 'is_realization',
        title: 'Реализация',
        formatter: (value) => value ? 'Да' : 'Нет',
      },
      {
        key: 'spp',
        title: 'СПП',
        formatter: (value) => value ? `${value}` : '',
      },
      {
        key: 'country_name',
        title: 'Страна',
      },
      {
        key: 'oblast_okrug_name',
        title: 'Округ',
      },
      {
        key: 'sale_id',
        title: 'ID продажи',
      }
    ];
</script>
<template>
  <DataView
    :fetch-method="fetchMethod"
    :columns="columns"
  />
</template>
<style lang="css" scoped>
    
</style>