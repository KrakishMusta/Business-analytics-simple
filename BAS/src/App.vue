<script setup>
    import { computed, ref, watch, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useStorage } from '@vueuse/core';
    import MasterMenu from './components/MasterMenu.vue';
    import DataGraph from './components/DataGraph.vue';
    import DateInput from './components/DateInput.vue';
    import { setDefaultDatesForRoute } from './assets/utils/dateHelper.js';

    const router = useRouter();
    const route = useRoute();
    const title = computed(() => router.currentRoute.value.meta.title)

    const storedDates = useStorage('dates', { start: '', end: '' });

    const startDate = ref(storedDates.value.start);
    const endDate = ref(storedDates.value.end);

    const logRouteInfo = () => {
        console.log('Информация о маршруте:', {
            path: route.path,
            fullPath: route.fullPath,
            name: route.name,
            params: route.params,
            meta: route.meta
        })
    }

    const setDates = (isInit = false) => {
        // logRouteInfo()
        
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

    watch(() => route.name, (newName, oldName) => {
        console.log(`Маршрут изменён: ${oldName} -> ${newName}`)
        setDates(true)
    }, { immediate: true });

    watch([startDate, endDate], ([newStart, newEnd]) => {
        storedDates.value = {
            start: newStart,
            end: newEnd
        };
        setDates()
        console.log('Даты обновлены в localStorage:', storedDates.value);
    });

    const handleDateChange = () => {
        console.log('Даты изменены:', {
            start: startDate.value,
            end: endDate.value
        });
    };

    onMounted(() => {
        console.log('Компонент смонтирован')
        setDates(true)
    })
</script>

<template>
    <MasterMenu/>
    <!-- <DataGraph/> -->
    <div class="wrapper">
        <div class="header-container">
            <button class="table-setting-btn bg-indigo-200 hover:bg-indigo-100 hover:cursor-cell">
                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <h1 class="page-title self-center">{{ title }}</h1>
            <div class="date-filters">
                <div class="flex">
                    <span class=" self-center">От</span>
                    <DateInput
                        :disabled="route.name === 'stocks'"
                        v-model="startDate"
                        placeholder="От yyyy-mm-dd"
                        />
                        <!-- @update:modelValue="handleDateChange" -->
                </div>
                <div v-if="route.name !== 'stocks'" class="flex">
                    <span class=" self-center">До</span>
                    <DateInput
                        v-model="endDate"
                        placeholder="До yyyy-mm-dd"
                        />
                        <!-- @update:modelValue="handleDateChange" -->
                </div>
            </div>
        </div>
        <div>
            <RouterView :key="router.currentRoute" :start-date="startDate" :end-date="endDate"/>
        </div>
    </div>
</template>

<style scoped>
    @import "tailwindcss";

    .wrapper {
        @apply flex flex-col px-5 sm:px-10 md:px-30 lg:px-50 box-border mt-10 w-full;
        max-width: 100vw;
    }

    .header-container {
        @apply flex relative md:flex-row gap-8 md:gap-12 items-start md:items-end text-cyan-950 mb-6;
    }

    .table-setting-btn {
        @apply inline-flex justify-center items-center self-center size-8 text-2xl;
    }

    .page-title {
        @apply font-bold text-2xl md:text-3xl whitespace-nowrap;
    }

    .date-filters {
        @apply flex flex-wrap max-sm:flex-col gap-4 md:gap-6;
    }
</style>
