<script setup>
    import { ref, onMounted, onUnmounted, watch } from 'vue';
    import { useStorage } from '@vueuse/core';
    import FilterRow from './FilterRow.vue';
    import ModalWrapper from './ModalWrapper.vue';
    import svgReloadIcon from './svgReloadIcon.vue';

    const props = defineProps({
        fields: Array, // Поле для анализа (например, 'quantity' или 'total_price')
        isLoading: Boolean, // Состояние загрузки данных
        progress: Number, // Прогресс загрузки (0-100)
        error: String, // Ошибка загрузки
        hasCachedData: Boolean // Есть ли кэшированные данные
    })

    const menuRef = ref(null);

    const columnsViewStorage = useStorage('table-columns-view', {})

    const isOpen = ref(false)

    const selectedColumns = ref({})

    const emit = defineEmits(['closeModal']);

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

    const closeModal = () => {
        console.log('Закрытие модального окна фильтров пользователем');
        emit('closeModal');
    };

    const handleClickOutside = (event) => {
        if (menuRef.value && !menuRef.value.contains(event.target)) {
            changeOpen(false)
        }
    }

    watch(selectedColumns, (newVal) => {
        for (const key in newVal) {
            columnsViewStorage.value[key] = { fieldKey: key, isView: newVal[key] }
        }
    }, { deep: true })

    onMounted(() => {
        props.fields.forEach(field => {
            if (!(field.key in columnsViewStorage.value)) {
            columnsViewStorage.value[field.key] = { fieldKey: field.key, isView: true }
            }
            selectedColumns.value[field.key] = columnsViewStorage.value[field.key].isView
        })
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
        class="flex flex-col gap-4 min-w-fit bg-white border-2 border-indigo-200 shadow-2xl shadow-indigo-200 absolute z-[60] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="flex px-4 py-2 justify-between box-border gap-4">
            <div class="flex gap-2 items-center">
                <h3 class="text-lg font-medium text-cyan-950">Видимость столбцов</h3>
            </div>
            <button 
                @click.stop="changeOpen(false)"
                class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class=" stroke-cyan-950 rotate-45 transform origin-center" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class="flex flex-col p-4">
          <div
            class="fild-row flex flex-row gap-4 md:text-sm lg:text-base text-cyan-950 font-bold text-nowrap"
            v-for="column in fields"
            :key="column.key"
          >
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="selectedColumns[column.key]"
                :value="column.key"
                type="checkbox"
              />
              <span>{{ column.title }}</span>
            </label>
          </div>
        </div>
    </div>
</template>
<style scoped>
    .container::-webkit-scrollbar {
        width: 8px;
    }

    .container::-webkit-scrollbar-track {
        background: oklch(92.2% 0.018 272.314);
    }

    .container::-webkit-scrollbar-thumb {
        background: oklch(87% 0.065 274.039);
        border-radius: 4px;
    }

    .container::-webkit-scrollbar-thumb:hover {
        background: oklch(0.785 0.115 274.713);
    }
</style>