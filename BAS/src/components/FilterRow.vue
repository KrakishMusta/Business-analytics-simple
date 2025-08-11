<script setup>
    import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useStorage } from '@vueuse/core';

    const props = defineProps({
        field: String,
        fieldKey: String
    })

    const emit = defineEmits(['addFilterItem', 'removeFilterItem'])

    const inputValue = ref('')
    const filterItems = ref([])
    
    // Получаем доступ к localStorage
    const filtersStorage = useStorage('business-analytics-filters', {})

    const addFilter = () => {
        console.log('=== ДОБАВЛЕНИЕ ФИЛЬТРА ===');
        console.log('Поле:', props.field, 'Ключ:', props.fieldKey);
        console.log('Текущее значение input:', inputValue.value);
        console.log('Текущие фильтры в localStorage:', filtersStorage.value);
        
        const trimmedValue = inputValue.value.trim();
        if (trimmedValue) {
            // Проверяем, есть ли уже фильтр с таким текстом
            const isDuplicate = filterItems.value.some(item => item.text === trimmedValue);
            if (!isDuplicate) {
                const newItem = {
                    text: trimmedValue
                }
                filterItems.value.push(newItem)
                console.log('Добавлен новый фильтр:', newItem);
                console.log('Обновленный список фильтров:', filterItems.value);
                
                emit('addFilterItem', {
                    fieldKey: props.fieldKey,
                    filterItem: newItem
                })
            } else {
                console.log('Фильтр с таким текстом уже существует:', trimmedValue);
            }
            inputValue.value = ''
        } else {
            console.log('Пустое значение, фильтр не добавлен');
        }
    }

    const handleKeydown = (event) => {
        if (event.key === 'Enter') {
            console.log('Нажата клавиша Enter, добавляем фильтр');
            addFilter()
        }
    }

    const handleBlur = () => {
        console.log('Потеря фокуса input, добавляем фильтр');
        addFilter()
    }

    const removeFilter = (itemId) => {
        console.log('=== УДАЛЕНИЕ ФИЛЬТРА ===');
        console.log('Поле:', props.field, 'Ключ:', props.fieldKey);
        console.log('Удаляемый фильтр:', itemId);
        console.log('Текущие фильтры:', filterItems.value);
        
        const index = filterItems.value.findIndex(item => item.text === itemId)
        if (index !== -1) {
            const removedItem = filterItems.value.splice(index, 1)[0]
            console.log('Удален фильтр:', removedItem);
            console.log('Обновленный список фильтров:', filterItems.value);
            
            emit('removeFilterItem', {
                fieldKey: props.fieldKey,
                filterItem: removedItem
            })
        } else {
            console.log('Фильтр для удаления не найден:', itemId);
        }
    }

    // Синхронизируем с изменениями в localStorage
    watch(() => filtersStorage.value[props.fieldKey], (newValue) => {
        if (newValue && newValue.filterItems) {
            filterItems.value = [...newValue.filterItems]
        } else {
            filterItems.value = []
        }
    }, { deep: true })

    onMounted(() => {
        console.log('=== ИНИЦИАЛИЗАЦИЯ FilterRow ===');
        console.log('Поле:', props.field, 'Ключ:', props.fieldKey);
        console.log('Фильтры в localStorage:', filtersStorage.value);
        
        if (filtersStorage.value[props.fieldKey] && filtersStorage.value[props.fieldKey].filterItems) {
            filterItems.value = [...filtersStorage.value[props.fieldKey].filterItems]
            console.log('Загружены существующие фильтры:', filterItems.value);
        } else {
            console.log('Существующих фильтров не найдено');
        }
    })
</script>
<template>
    <div class="bg-indigo-200 rounded h-fit">
        <p class="px-2 py-2 truncate">{{field}}</p>
    </div>
    <div class="col-2 flex gap-2">
        <div v-if="filterItems.length > 0" class="flex flex-wrap gap-1">
            <div 
                v-for="item in filterItems" 
                :key="item.text"
                class="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded text-sm"
            >
                <span>{{ item.text }}</span>
                <button 
                    @click.stop="removeFilter(item.text)"
                    class="text-indigo-950 hover:text-white text-xs"
                >
                    ×
                </button>
            </div>
        </div>
        <input
            v-model="inputValue"
            type="text" 
            class="self-start max-w-min px-3 py-2 border border-gray-300 rounded"
            :placeholder="`Добавить`"
            @keydown="handleKeydown"
            @blur="handleBlur"
        />
    </div>
</template>
<style scoped>
.textarea-centered {
    min-height: 2.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    line-height: 1.2;
    resize: none;
}

.textarea-centered::placeholder {
    color: #9ca3af;
    opacity: 1;
    position: relative;
    top: 0.25rem;
}
</style>