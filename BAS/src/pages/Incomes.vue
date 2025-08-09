
<script setup>
    import { onMounted, watch } from 'vue';
    import { fetchMethod } from '@/assets/utils/apis/incomesAPI';
    import DataView from '../components/DataView.vue';

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

</script>
<template>
    <DataView
        :fetch-method="fetchMethod"
        :columns="columns"
    />
</template>
<style lang="css" scoped>
    
</style>