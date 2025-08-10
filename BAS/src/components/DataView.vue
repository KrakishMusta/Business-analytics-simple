<script setup>
    import { computed, ref, watch, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useStorage } from '@vueuse/core';
    import DateInput from './DateInput.vue';
    import TableWithPagination from './Table.vue';
    import DataGraph from './DataGraphModal.vue';
    import Filters from './FiltersModal.vue';
    import svgFilterIcon from './svgFilterIcon.vue';
    import svgGraphIcon from './svgGraphIcon.vue';
    import { setDefaultDatesForRoute } from '../assets/utils/dateHelper.js';
    import usePaginatedTable from '@/composables/usePaginatedTable';
    import useFullDataLoader from '@/composables/useFullDataLoader';

    const props = defineProps({
      fetchMethod: Function,
      columns: Array
    });

    const {
      data: tableData,
      loading,
      error,
      pagination,
      sortField,
      sortDirection,
      fetchData,
      sort
    } = usePaginatedTable(props.fetchMethod);


    const router = useRouter();
    const route = useRoute();
    const title = computed(() => router.currentRoute.value.meta.title)
    const filtersRef = ref(null);

    const storedDates = useStorage('dates', { start: '', end: '' });

    const startDate = ref(storedDates.value.start);
    const endDate = ref(storedDates.value.end);

    const setDates = (isInit = false) => {
        if(isInit)
        {
            if (!route.name) {
                console.error('Имя маршрута не определено!')
                return
            }
            const defaults = setDefaultDatesForRoute(route.name);

            startDate.value = defaults.start;
            endDate.value = defaults.end;

            storedDates.value = {
                start: defaults.start,
                end: defaults.end
            };

            console.log('Установлены даты:', defaults)
        }
        else
        {
            storedDates.value = {
                start: startDate.value,
                end: endDate.value
            };
        }
    }

    const showGraph = () => {
        console.log('showGraph')
    }

    const showFilters = () => {
        filtersRef.value.changeOpen(true)
    }

    watch(() => route.name, (newName, oldName) => {
        console.log(`Маршрут изменён: ${oldName} -> ${newName}`)
        setDates(true)
    }, { immediate: true });

    watch([startDate, endDate], ([newStart, newEnd]) => {
        storedDates.value = {
            start: newStart,
            end: newEnd
        };
        setDates();
        fetchData(1);
        console.log('Даты обновлены в localStorage:', storedDates.value);
    });

    onMounted(() => {
        setDates(true);
        fetchData();
    });
</script>

<template>
    <!-- <DataGraph
        :data=""
        :field="columns"
    /> -->
    <Filters
        ref="filtersRef"
        :fields="columns"
    />
    <div class="flex flex-col px-5 sm:px-10 md:px-8 lg:px-10 box-border mt-10 w-full max-w-screen-2xl mx-auto">
        <div class="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center mb-6 text-cyan-950">
            <div class="flex flex-row gap-6">
                <button 
                    class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class=" stroke-cyan-950" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                        
                <button class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svgGraphIcon/>
                </button>

                <button 
                    @click="showFilters"
                    class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svgFilterIcon/>
                </button>
            </div>
            
            <h1 class="font-bold text-2xl md:text-3xl whitespace-nowrap">{{ title }}</h1>
            
            <div class="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div class="flex items-center gap-2">
                    <span>От</span>
                    <DateInput
                        :disabled="route.name === 'stocks'"
                        v-model="startDate"
                        placeholder="От yyyy-mm-dd"
                    />
                </div>
                <div v-if="route.name !== 'stocks'" class="flex items-center gap-2">
                    <span>До</span>
                    <DateInput
                        v-model="endDate"
                        placeholder="До yyyy-mm-dd"
                    />
                </div>
            </div>
        </div>
        
        <div class="w-full">
            <TableWithPagination
                :data="tableData"
                :loading="loading"
                :error="error"
                :pagination="pagination"
                :sort-field="sortField"
                :sort-direction="sortDirection"
                :columns="columns"
                @page-change="fetchData"
                @sort="sort"
            />
        </div>
    </div>
</template>

<style scoped>

</style>