<script setup>
    import { ref, onMounted, onUnmounted, watch } from 'vue';
    import { useStorage } from '@vueuse/core';
    import FilterRow from './FilterRow.vue';
    import svgReloadIcon from './svgReloadIcon.vue';

    const props = defineProps({
        fields: Array, // Поле для анализа (например, 'quantity' или 'total_price')
        isLoading: Boolean, // Состояние загрузки данных
        progress: Number, // Прогресс загрузки (0-100)
        error: String, // Ошибка загрузки
        hasCachedData: Boolean // Есть ли кэшированные данные
    })

    const menuRef = ref(null);

    const filtersStorage = useStorage('business-analytics-filters', {})

    const isReloadData = ref(false);
    
    const filters = ref({})

    const isOpen = ref(false)

    const changeOpen = (value = true) => {
        isOpen.value = value;

        console.log('Отображение окон завершения', props.isLoading, props.progress)
        
        // Добавляем обработчик клика вне модального окна
        if (value) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside)
            }, 0)
        } else {
            document.removeEventListener('click', handleClickOutside)
        }
    }

    const emit = defineEmits(['applyFilters', 'closeModal', 'reloadData']);

    const applyFiltersToData = () => {
        console.log('=== НАЧАЛО ПРИМЕНЕНИЯ ФИЛЬТРОВ В МОДАЛЬНОМ ОКНЕ ===');
        console.log('Состояние загрузки:', props.isLoading);
        console.log('Прогресс:', props.progress);
        console.log('Ошибка:', props.error);
        
        emit('applyFilters');
        // НЕ закрываем модальное окно автоматически
        // changeOpen(false);
        console.log('Модальное окно остается открытым для отображения прогресса');
    };

    const closeModal = () => {
        console.log('Закрытие модального окна фильтров пользователем');
        emit('closeModal');
    };

    const reloadData = () => {
        console.log('Принудительная перезагрузка данных');
        emit('reloadData');
    };

    const handleClickOutside = (event) => {
        if (menuRef.value && !menuRef.value.contains(event.target)) {
            changeOpen(false)
        }
    }

    // Автоматическое закрытие модального окна через 5 секунд после завершения загрузки
    watch([() => props.isLoading, () => props.progress], ([isLoading, progress]) => {
        if (!isLoading && progress >= 100) {
            console.log('Загрузка завершена, планируем автоматическое закрытие через 5 секунд');
            const timer = setTimeout(() => {
                if (!props.isLoading && props.progress >= 100) {
                    console.log('Автоматическое закрытие модального окна');
                    closeModal();
                }
            }, 5000);
            
            // Очищаем таймер при размонтировании
            onUnmounted(() => clearTimeout(timer));
        }
    });

    const handleAddFilterItem = (data) => {
        console.log('=== ОБРАБОТКА ДОБАВЛЕНИЯ ФИЛЬТРА В МОДАЛЬНОМ ОКНЕ ===');
        console.log('Полученные данные:', data);
        
        const { fieldKey, filterItem } = data        
        
        // Проверяем, существует ли фильтр для данного поля
        if (!filtersStorage.value[fieldKey]) {
            console.log('Создаем новую структуру фильтра для поля:', fieldKey);
            filtersStorage.value[fieldKey] = {
                fieldKey: fieldKey,
                filterItems: []
            }
        }

        filtersStorage.value[fieldKey].filterItems.push(filterItem)
        filters.value = { ...filtersStorage.value }
        
        console.log('Фильтр добавлен в localStorage:', filtersStorage.value[fieldKey]);
        console.log('Обновленное состояние фильтров:', filters.value);
        
        // emit('filtersChanged', filters.value)
    }

    const handleRemoveFilterItem = (data) => {
        console.log('=== ОБРАБОТКА УДАЛЕНИЯ ФИЛЬТРА В МОДАЛЬНОМ ОКНЕ ===');
        console.log('Полученные данные:', data);
        
        const { fieldKey, filterItem } = data
        
        if (filtersStorage.value[fieldKey]) {
            console.log('Найдена структура фильтра для поля:', fieldKey);
            console.log('Текущие фильтры поля:', filtersStorage.value[fieldKey].filterItems);
            
            const index = filtersStorage.value[fieldKey].filterItems.findIndex(
                item => item.text === filterItem.text
            )
            console.log('Индекс удаляемого фильтра:', index);
            
            if (index !== -1) {
                const removedItem = filtersStorage.value[fieldKey].filterItems.splice(index, 1)[0]
                filters.value = { ...filtersStorage.value }
                
                console.log('Удален фильтр:', removedItem);
                console.log('Обновленное состояние фильтров:', filters.value);
                
                // emit('filtersChanged', filters.value)
            } else {
                console.log('Фильтр для удаления не найден в localStorage');
            }
        } else {
            console.log('Структура фильтра для поля не найдена:', fieldKey);
        }
    }

    onMounted(() => {
        console.log('=== ИНИЦИАЛИЗАЦИЯ FiltersModal ===');
        console.log('Поля для фильтрации:', props.fields);
        console.log('Текущие фильтры в localStorage:', filtersStorage.value);

        // Создаем структуру фильтров для каждого поля
        props.fields.forEach(field => {
            console.log('Инициализация фильтра для поля:', field.key, field.title);
            // Упрощаем: всегда инициализируем фильтр для поля, не проверяя наличие
            filtersStorage.value[field.key] = {
                fieldKey: field.key,
                filterItems: []
            }
        })
        
        // Копируем данные в локальное состояние
        filters.value = { ...filtersStorage.value }
        console.log('Инициализированное состояние фильтров:', filters.value);
        console.log('=== ИНИЦИАЛИЗАЦИЯ FiltersModal ЗАВЕРШЕНА ===');
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
        class="flex flex-col gap-4 max-w-[70%] max-h-[60%] min-w-[50%] min-h-[50%] bg-white border-2 border-indigo-200 shadow-2xl shadow-indigo-200 absolute z-[60] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="flex px-4 pt-2 justify-between box-border">
            <div class="flex gap-2 items-center">
                <h3 class="text-lg font-medium text-cyan-950">Фильтры</h3>
                <button 
                    @click.stop="applyFiltersToData" 
                    :disabled="isLoading"
                    class="bg-indigo-200 hover:bg-indigo-100 px-2 py-1 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isLoading ? 'Загрузка...' : 'Применить' }}
                </button>
            </div>
            <button 
                @click.stop="closeModal"
                class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class=" stroke-cyan-950 rotate-45 transform origin-center" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        
        <!-- Индикатор прогресса загрузки -->
        <div v-if="isLoading" class="px-4 pb-2">
            <div class="flex items-center gap-2 mb-2">
                <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-950 rounded-full animate-spin"></div>
                <span class="text-sm text-cyan-950">Загрузка данных...</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                    class="bg-cyan-950 h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${progress}%` }">
                </div>
            </div>
            <div class="text-xs text-indigo-200 mt-1">{{ Math.round(progress) }}%</div>
        </div>
        
        <!-- Отображение ошибки -->
        <div v-if="error" class="px-4 pb-2">
            <div class="bg-indigo-950 border text-red-700 px-2 py-2 rounded text-sm">
                Ошибка загрузки: {{ error }}
            </div>
        </div>
        
        <!-- Кнопка закрытия после завершения загрузки -->
        <div v-if="!isLoading && progress >= 100" class="px-4 pb-2">
            <div class="bg-indigo-200 border text-indigo-800 px-2 py-2 rounded text-sm mb-2">
                Загрузка данных завершена успешно!
            </div>
            <button 
                @click.stop="closeModal"
                class="bg-indigo-950 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm">
                Закрыть
            </button>
        </div>
        
        <!-- Информация о загруженных данных -->
        <div v-if="!isLoading && progress >= 100" class="px-4 pb-2">
            <div class="text-xs text-gray-600">
                Модальное окно автоматически закроется через 5 секунд или можно закрыть вручную
            </div>
        </div>
        
        <!-- Информация о кэшированных данных -->
        <div v-if="hasCachedData && !isLoading && progress === 0" class="flex justify-between px-4 pb-2">
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded-l-md text-sm">
                Используются кэшированные данные из localStorage
            </div>
            <button 
                    v-if="hasCachedData && !isLoading"
                    @click.stop="reloadData"
                    class=" flex gap-2 bg-indigo-950 hover:bg-indigo-800 px-2 py-1 rounded-r-md cursor-pointer text-xs text-indigo-200">
                    <svgReloadIcon class=" self-center"/> 
                    <span class=" self-center">Перезагрузить</span>
            </button>
        </div>
        <div class=" grid grid-cols-[max-content] flex-col gap-x-4 gap-y-2 container p-4 box-border pt-0 overflow-y-auto">
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