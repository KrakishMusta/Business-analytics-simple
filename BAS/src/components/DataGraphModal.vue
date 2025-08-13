<script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import { useStorage } from '@vueuse/core';
  import { useRouter, useRoute } from 'vue-router';
  import Chart from 'chart.js/auto'
  import ModalWrapper from './ModalWrapper.vue';
  import { useTableStore } from '@/stores/tableStore'
  import { chartConfigs } from '@/composables/chartConfigs';

  const props = defineProps({
    data: Array,
    fields: Array, // Поле для анализа (например, 'quantity' или 'total_price')
    isLoading: Boolean,
    progress: Number,
    error: String,
    hasCachedData: Boolean
  })

  const emit = defineEmits(['loadData', 'closeModal', 'reloadData']);


  const menuRef = ref(null);
  const isOpen = ref(false)

  const route = useRoute();
  const tableName = computed(() => route.name);

  const store = useTableStore();
  const tableData = computed(() => store.tables[tableName.value]?.allData || []);

  
  const selectedField = ref(
    props.fields.find(f => typeof tableData.value[0]?.[f.key] === 'number')?.key 
    || props.fields[0].key
  )
  const selectedGraphType = ref('line')
  const GRAPH_TYPES = [
    { key: 'line', title: 'Линейный' },
    { key: 'bar', title: 'Столбчатый' },
    { key: 'pie', title: 'Круговая диаграмма' },
    { key: 'doughnut', title: 'Кольцевая диаграмма' }
  ]

  const selectedFieldObj = computed(() => {
    return props.fields.find(f => f.key === selectedField.value) || null;
  });

  const labelTitle = computed(() => {
    return selectedFieldObj.value ? selectedFieldObj.value.title : '';
  });

  const chartCanvas = ref(null)
  let chartInstance = null

  // Подготовка данных для графика
  // const prepareChartData = async () => {
  //   if (!selectedField.value || tableData.value.length === 0) {
  //     await emit('loadData');
  //   }

  //   // Группировка по дате
  //   const grouped = {};
  //   tableData.value.forEach(item => {
  //     const dateKey = new Date(item.date).toLocaleDateString('ru-RU');
  //     const value = parseFloat(item[selectedField.value]) || 0;
  //     if (!grouped[dateKey]) {
  //       grouped[dateKey] = 0;
  //     }
  //     grouped[dateKey] += value;
  //   });

  //   const labels = Object.keys(grouped);
  //   const values = Object.values(grouped);

  //   // Генерация уникальных цветов
  //   const backgroundColors = labels.map((_, i) => `hsl(${i * (360 / labels.length)}, 100%, 50%)`);
  //   const borderColors = backgroundColors.map(color => color.replace('100%', '40%'));

  //   return {
  //     labels,
  //     datasets: [
  //       {
  //         label: `График по полю "${labelTitle.value}"`,
  //         data: values,
  //         backgroundColor: backgroundColors,
  //         borderColor: borderColors,
  //         borderWidth: 1
  //       }
  //     ]
  //   };
  // };
  function generateColors(count) {
    return Array.from({ length: count }, (_, i) => `hsl(${i * (360 / count)}, 70%, 50%)`);
  }

  function buildChartData(data, fieldKey) {
    // Если нет конфига, создаём дефолтный
    const config = chartConfigs[fieldKey] || {
      label: `График по ${fieldKey}`,
      groupBy: 'date', // предполагается, что в данных есть поле date
      xAxisFormatter: key => {
        // Если ключ — дата, форматируем красиво, иначе просто строка
        const d = new Date(key);
        return isNaN(d) ? key : d.toLocaleDateString('ru-RU');
      },
      valueAggregator: rows => {
        // Суммируем значения в поле fieldKey, если число
        return rows.reduce((sum, r) => sum + (parseFloat(r[fieldKey]) || 0), 0);
      },
      chartType: selectedGraphType.value || 'line'
    };

    const grouped = {};
    data.forEach(row => {
      const key = row[config.groupBy];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const labels = Object.keys(grouped).map(config.xAxisFormatter);
    const values = Object.values(grouped).map(config.valueAggregator);

    return {
      labels,
      datasets: [
        {
          label: config.label,
          data: values,
          backgroundColor: generateColors(labels.length)
        }
      ]
    };
  }




  // Создание/обновление графика
  const updateChart = async () => {
    console.log('updateChart')

    if (!selectedField.value || tableData.value.length === 0) {
      console.log('Данные отсутствуют, эмитим loadData и ждём загрузки...');
      await emit('loadData');  // ждем, пока загрузятся данные (предполагается, что слушатель обновит tableData)
    }
    if (chartInstance) {
      chartInstance.destroy()
    }

    const chartData = await buildChartData(tableData.value, selectedField.value);
    console.log(chartData)
    if (!chartData) return;

    const configType = chartConfigs[selectedField.value]?.chartType || selectedGraphType.value;

    if (chartCanvas.value) {
      const ctx = chartCanvas.value.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: configType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Аналитика по ${chartConfigs[selectedField.value]?.label || labelTitle.value}`
            },
            legend: {
              position: 'top',
              labels: {
                color: '#053345',
                font: { size: 12 }
              }
            }
          },
          scales:
            configType === 'pie' || configType === 'doughnut'
              ? {}
              : { y: { beginAtZero: true } }
        }
      });
    }
  };

  // Человекочитаемые названия полей
  // const getFieldName = field => {
  //   const names = {
  //     quantity: 'Количеству',
  //     total_price: 'Сумме',
  //     income_id: 'ID поставки'
  //   }
  //   return names[field] || field
  // }

  const handleClickOutside = (event) => {
        if (menuRef.value && !menuRef.value.contains(event.target)) {
            changeOpen(false)
        }
  }

  const changeOpen = (value = true) => {
      isOpen.value = value;

      console.log('Отображение окон завершения', isOpen.value)
      
      // Добавляем обработчик клика вне модального окна
      if (value) {
          setTimeout(() => {
              document.addEventListener('click', handleClickOutside)
          }, 0)
          updateChart()
      } else {
          document.removeEventListener('click', handleClickOutside)
      }
  }

  const closeModal = () => {
      console.log('Закрытие модального окна фильтров пользователем');
      emit('closeModal');
  };

  // watch([selectedField, selectedGraphType, tableData], () => {
  watch([selectedField, selectedGraphType], () => {
    updateChart()
  })

  // onMounted(
  //   () => 
  //   {
  //     console.log(1)
  //     updateChart()
  //   }
  // )

  defineExpose({ 
      changeOpen,
      updateChart
  });
</script>

<template>
  <div v-if="isOpen" ref="menuRef"
    class="flex flex-col gap-4 md:w-fit md:max-w-[80%] md:min-w-[70%] max-h-[60%] min-h-[50%] bg-white border-2 border-indigo-200 shadow-2xl shadow-indigo-200 absolute z-[60] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div class="flex px-4 py-2 justify-between box-border">
      <div class="flex gap-2 items-center">
          <h3 class="text-lg font-medium text-cyan-950">Графики</h3>
      </div>
      <button 
          @click.stop="changeOpen(false)"
          class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
          <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path class=" stroke-cyan-950 rotate-45 transform origin-center" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
      </button>
    </div>
    <div class="flex flex-row gap-4 p-4 justify-between box-border">
        <div class="flex flex-col w-full">
            <div class="flex flex-col w-full">
                <div>
                  <div v-if="isLoading" class="self-center">
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
                  <div class="chart-container flex-[1]">
                    <canvas ref="chartCanvas"></canvas>
                  </div>
                </div>
                <div class="flex flex-row gap-4 justify-center text-nowrap md:text-wrap lg:flex-row md:flex-col md:self-center">
                  <label
                    v-for="type in GRAPH_TYPES"
                    :key="type.key"
                    :class="{
                      'cursor-pointer': selectedGraphType !== type.key,
                      'cursor-default': selectedGraphType === type.key
                    }"
                    class="flex items-center gap-2 md:text-sm"
                  >
                    <input
                      v-model="selectedGraphType"
                      :value="type.key"
                      type="radio"
                    />
                    <span>{{ type.title }}</span>
                  </label>
                </div>
            </div>
            <!-- <div>

            </div> -->
        </div>
        <div class="flex flex-col">
          <div
            class="fild-row flex flex-row gap-4 md:text-sm lg:text-base text-cyan-950 font-bold text-nowrap"
            v-for="column in fields"
            :key="column.key"
          >
            <label :class="{ 'cursor-pointer': selectedField !== column.key, 'cursor-default': selectedField === column.key }" class="flex items-center gap-2">
              <input
                v-model="selectedField"
                :value="column.key"
                type="radio"
              />
              <span>{{ column.title }}</span>
            </label>
          </div>
          <!-- <button>
            Кнопка
          </button> -->
        </div>
    </div>

  </div>  
</template>

<style scoped>
    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 400px; /* или больше, если нужно */
      position: relative; /* обязательно для Chart.js */
    }

    .chart-container canvas {
      width: fit-content !important;
      height: fit-content !important;
    }
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