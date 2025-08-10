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
        const trimmedValue = inputValue.value.trim();
        if (trimmedValue) {
            // Проверяем, есть ли уже фильтр с таким текстом
            const isDuplicate = filterItems.value.some(item => item.text === trimmedValue);
            if (!isDuplicate) {
                const newItem = {
                    text: trimmedValue
                }
                filterItems.value.push(newItem)
                emit('addFilterItem', {
                    fieldKey: props.fieldKey,
                    filterItem: newItem
                })
            }
            inputValue.value = ''
        }
    }

    const handleKeydown = (event) => {
        if (event.key === 'Enter') {
            addFilter()
        }
    }

    const handleBlur = () => {
        addFilter()
    }

    const removeFilter = (itemId) => {
        const index = filterItems.value.findIndex(item => item.id === itemId)
        if (index !== -1) {
            const removedItem = filterItems.value.splice(index, 1)[0]
            emit('removeFilterItem', {
                fieldKey: props.fieldKey,
                filterItem: removedItem
            })
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
        if (filtersStorage.value[props.fieldKey] && filtersStorage.value[props.fieldKey].filterItems) {
            filterItems.value = [...filtersStorage.value[props.fieldKey].filterItems]
        }
    })
</script>
<template>
    <div class="bg-indigo-200 rounded">
        <p class="px-2 py-2 truncate">{{field}}</p>
    </div>
    <div class="col-2 flex">
        <div v-if="filterItems.length > 0" class="flex flex-wrap gap-1">
            <div 
                v-for="item in filterItems" 
                :key="item.id"
                class="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded text-sm"
            >
                <span>{{ item.text }}</span>
                <button 
                    @click="removeFilter(item.id)"
                    class="text-indigo-600 hover:text-indigo-800 text-xs"
                >
                    ×
                </button>
            </div>
        </div>
        <input
            type="text" 
            class="max-w-min px-3 py-1 border border-gray-300 rounded self-center"
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