<script setup>
import { ref } from 'vue';
import api from '@/assets/utils/apis/api';

const btnRef = ref(null);
const responseData = ref('Click me'); // Отдельная реактивная переменная для текста кнопки

const fetchSalesTest = async () => {
    try {
        const response = await api.get('/sales', {
            params: {
                dateFrom: '2022-08-04',
                dateTo: '2025-08-04',
                page: 1,
                limit: 5,
            },
        });
        
        // Показываем только данные из ответа
        responseData.value = JSON.stringify(response.data, null, 2);
        console.log('Response:', response.data);
    } catch(err) {
        console.error('Error:', err);
        responseData.value = 'Error occurred';
    }
}
</script>

<template>
    <button 
        class="cursor-pointer w-20 h-16 bg-amber-900" 
        ref="btnRef" 
        @click="fetchSalesTest"
    >
        {{ responseData }}
    </button>
</template>

<style scoped>
</style>