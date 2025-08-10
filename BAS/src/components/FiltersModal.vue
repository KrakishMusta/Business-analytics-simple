<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import { useStorage } from '@vueuse/core';
    import FilterRow from './FilterRow.vue';

    const props = defineProps({
        fields: Array // Поле для анализа (например, 'quantity' или 'total_price')
    })

    const menuRef = ref(null);

    const filtersStorage = useStorage('business-analytics-filters', {})
    
    const filters = ref({})

    const isOpen = ref(false)

    const changeOpen = (value = true) => {
        isOpen.value = value
        
        // Добавляем обработчик клика вне модального окна
        if (value) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside)
            }, 0)
        } else {
            document.removeEventListener('click', handleClickOutside)
        }
    }

    const handleClickOutside = (event) => {
        if (menuRef.value && !menuRef.value.contains(event.target)) {
            changeOpen(false)
        }
    }

    const handleAddFilterItem = (data) => {
        const { fieldKey, filterItem } = data        
        
        // Проверяем, существует ли фильтр для данного поля
            filtersStorage.value[fieldKey] = {
                fieldKey: fieldKey,
                filterItems: []
            }

        filtersStorage.value[fieldKey].filterItems.push(filterItem)
        filters.value = { ...filtersStorage.value }
        
        // emit('filtersChanged', filters.value)
    }

    const handleRemoveFilterItem = (data) => {
        const { fieldKey, filterItem } = data
        
        if (filtersStorage.value[fieldKey]) {
            const index = filtersStorage.value[fieldKey].filterItems.findIndex(
                item => item.id === filterItem.id
            )
            if (index !== -1) {
                filtersStorage.value[fieldKey].filterItems.splice(index, 1)
                filters.value = { ...filtersStorage.value }
                
                // emit('filtersChanged', filters.value)
            }
        }
    }

    onMounted(() => {
        // Создаем структуру фильтров для каждого поля
        props.fields.forEach(field => {
            // Упрощаем: всегда инициализируем фильтр для поля, не проверяя наличие
            filtersStorage.value[field.key] = {
                fieldKey: field.key,
                filterItems: []
            }
        })
        
        // Копируем данные в локальное состояние
        filters.value = { ...filtersStorage.value }
    })

    // Очищаем обработчик при размонтировании
    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
    })

    defineExpose({ 
        changeOpen,
    });
</script>
<template>
    <div v-if="isOpen" ref="menuRef"
        class="flex flex-col gap-4 max-w-[50%] max-h-[60%] min-w-[50%] min-h-[50%] bg-white border-2 border-indigo-200 shadow-2xl shadow-indigo-200 absolute z-[60] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="flex px-2 pt-2 justify-between box-border">
            <h3 class="text-lg font-medium text-cyan-950">Фильтры</h3>
            <button 
                @click.stop="changeOpen(false)"
                class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class=" stroke-cyan-950 rotate-45 transform origin-center" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class=" grid grid-cols-[max-content] flex-col gap-2 container p-4 box-border pt-0 overflow-y-auto">
            <FilterRow
                v-for="field in fields"
                :key="field.key"
                :field="field.title"
                :field-key="field.key"
                @add-filter-item="handleAddFilterItem"
                @remove-filter-item="handleRemoveFilterItem"
            />            
        </div>
    </div>
</template>
<style scoped>
    .container::-webkit-scrollbar {
        width: 8px;
    }

    .container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }

    .container::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
</style>