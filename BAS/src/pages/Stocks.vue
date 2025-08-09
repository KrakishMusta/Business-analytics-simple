
<script setup>
    import { onMounted, watch } from 'vue';
    import { fetchMethod } from '@/assets/utils/apis/stocksAPI';
    import DataView from '../components/DataView.vue';

    const columns = [
      { 
        key: 'date', 
        title: 'Дата',
        formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
      },
      { 
        key: 'last_change_date', 
        title: 'Дата изменения',
        formatter: (value) => value ? new Date(value).toLocaleString() : ''
      },
      { 
        key: 'supplier_article', 
        title: 'Артикул поставщика' 
      },
      { 
        key: 'tech_size', 
        title: 'Технический размер' 
      },
      { 
        key: 'barcode', 
        title: 'Штрихкод',
        formatter: (value) => value ? String(value).replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : ''
      },
      { 
        key: 'quantity', 
        title: 'Количество',
        align: 'right',
        formatter: (value) => value?.toLocaleString() ?? ''
      },
      { 
        key: 'is_supply', 
        title: 'В поставке',
        formatter: (value) => value ? 'Да' : 'Нет'
      },
      { 
        key: 'is_realization', 
        title: 'В реализации',
        formatter: (value) => value ? 'Да' : 'Нет'
      },
      { 
        key: 'quantity_full', 
        title: 'Полное кол-во',
        align: 'right',
        formatter: (value) => value?.toLocaleString() ?? ''
      },
      { 
        key: 'warehouse_name', 
        title: 'Склад' 
      },
      { 
        key: 'in_way_to_client', 
        title: 'В пути к клиенту',
        align: 'right',
        formatter: (value) => value?.toLocaleString() ?? ''
      },
      { 
        key: 'in_way_from_client', 
        title: 'В пути от клиента',
        align: 'right',
        formatter: (value) => value?.toLocaleString() ?? ''
      },
      { 
        key: 'nm_id', 
        title: 'ID WB',
        formatter: (value) => value?.toLocaleString() ?? ''
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
        key: 'sc_code', 
        title: 'Код поставщика',
        formatter: (value) => value?.toLocaleString() ?? ''
      },
      { 
        key: 'price', 
        title: 'Цена',
        align: 'right',
        formatter: (value) => value ? `${parseFloat(value).toLocaleString('ru-RU')}` : ''
      },
      { 
        key: 'discount', 
        title: 'Скидка',
        align: 'right',
        formatter: (value) => value ? `${parseFloat(value).toLocaleString('ru-RU')}` : ''
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