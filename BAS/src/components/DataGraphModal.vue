<script setup>
  import { ref, onMounted, watch } from 'vue'
  import Chart from 'chart.js/auto'

  const props = defineProps({
    data: Array,
    field: Array // Поле для анализа (например, 'quantity' или 'total_price')
  })

const chartCanvas = ref(null)
let chartInstance = null

// Подготовка данных для графика
const prepareChartData = () => {
  const labels = props.data.map(item => new Date(item.date).toLocaleDateString('ru-RU'))
  const values = props.data.map(item => parseFloat(item[props.field]))
  
  return {
    labels,
    datasets: [{
      label: `График по полю "${props.field}"`,
      data: values,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }
}

// Создание/обновление графика
const updateChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (chartCanvas.value && props.data.length > 0) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line', // Можно изменить на 'bar', 'pie' и др.
      data: prepareChartData(),
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Аналитика по ${getFieldName(props.field)}`
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

// Человекочитаемые названия полей
const getFieldName = (field) => {
  const names = {
    'quantity': 'Количеству',
    'total_price': 'Сумме',
    'income_id': 'ID поставки',
    // Добавьте другие поля при необходимости
  }
  return names[field] || field
}

// Инициализация при монтировании и при изменении данных
onMounted(updateChart)
    watch(() => [props.data, props.field], updateChart)
</script>

<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>