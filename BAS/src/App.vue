<script setup>
    import { computed } from 'vue';
    import { useRouter } from 'vue-router';
    import MasterMenu from './components/MasterMenu.vue';

    const router = useRouter();
    const title = computed(() => router.currentRoute.value.meta.title)
</script>

<template>
    <MasterMenu></MasterMenu>
    <div class="wrapper">
        <div class="header-container">
            <h1 class="page-title md:self-center">{{ title }}</h1>
            <div class="date-filters">
                <input class="date-input" placeholder="От yyyy-mm-dd">
                <input class="date-input" placeholder="До yyyy-mm-dd">
            </div>
        </div>
        <div>
            <RouterView :key="router.currentRoute"/>
        </div>
    </div>
</template>

<style scoped>
    @import "tailwindcss";

    @media (width) {
        
    }
    .wrapper {
        @apply flex flex-col p-5 sm:px-10 md:px-30 lg:px-50 box-border mt-10 w-full;
        max-width: 100vw;
    }

    .header-container {
        @apply flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-end text-cyan-950 mb-6;
        /* min-width: fit-content; */
    }

    .page-title {
        @apply font-bold text-2xl md:text-3xl whitespace-nowrap;
    }

    .date-filters {
        @apply flex gap-4 md:gap-6 flex-wrap;
    }

    .date-input {
        @apply box-border align-bottom border-b border-cyan-950 focus:outline-none pl-2 py-1;
        min-width: 150px;
    }
</style>
