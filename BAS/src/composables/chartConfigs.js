export const chartConfigs = {
    warehouse_name: {
      label: 'Склад',
      groupBy: 'warehouse_name',
      valueField: 'quantity', // что суммируем
      valueAggregator: (items) => items.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0),
      chartType: 'bar', // bar | pie | line
      xAxisFormatter: (val) => val, // необязательная функция форматирования
    },
    supplier_article: {
      label: 'Артикул поставщика',
      groupBy: 'supplier_article',
      valueField: 'quantity',
      valueAggregator: (items) => items.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0),
      chartType: 'bar',
      xAxisFormatter: (val) => val,
    },
    date: {
      label: 'Дата',
      groupBy: 'date',
      valueField: 'quantity',
      valueAggregator: (items) => items.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0),
      chartType: 'line',
      xAxisFormatter: (val) => new Date(val).toLocaleDateString('ru-RU'),
    },
    brand: {
      label: 'Бренд',
      groupBy: 'brand',
      valueField: 'total_price',
      valueAggregator: (items) => items.reduce((sum, row) => sum + (parseFloat(row.total_price) || 0), 0),
      chartType: 'pie',
      xAxisFormatter: (val) => val,
    }
  };  