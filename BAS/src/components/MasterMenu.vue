<script setup>
    import { useRoute } from 'vue-router';

    const route = useRoute();

    const isCurrentRoute = (name) => {
        return route.name === name;
    }
</script>

<template>
    <div class=" flex sticky z-50 w-[100%] bg-indigo-200 px-8 max-sm:px-2 max-sm:text-[1rem]">
        <nav class="flex justify-self-start w-[fit-content] h-14">
            <RouterLink class="menu-item" v-if="!isCurrentRoute('welcome')" to="/">Главная</RouterLink>
        </nav>
        <nav class=" justify-self-center mx-[auto] flex justify-between items-center w-[fit-content] h-14 gap-6 max-sm:mx-0">
            <RouterLink class="menu-item" v-if="!isCurrentRoute('sales')" to="/sales">Продажи</RouterLink>
            <RouterLink class="menu-item" v-if="!isCurrentRoute('orders')" to="/orders">Заказы</RouterLink>
            <RouterLink class="menu-item" v-if="!isCurrentRoute('stocks')" to="/stocks">Склады</RouterLink>
            <RouterLink class="menu-item" v-if="!isCurrentRoute('incomes')" to="/incomes">Доходы</RouterLink>
        </nav>
    </div>
</template>

<style scoped>
    @import "tailwindcss";

    @layer components {
        .menu-item
        {
            @apply flex items-center px-4 w-[fit-content] h-[100%] text-cyan-950 font-bold;
        }
        .menu-item:hover
        {
            @apply bg-indigo-300;
        }
    }
</style>
