<script setup>
        import svgFilterIcon from '@/components/svgFilterIcon.vue';
        import svgGraphIcon from '@/components/svgGraphIcon.vue';

</script>

<template>
    <div class="flex flex-col px-5 sm:px-10 md:px-8 lg:px-10 box-border mt-10 w-full max-w-screen-2xl mx-auto">
        <div class="flex flex-col gap-6 text-cyan-950 font-bold w-fit self-center lg:text-lg sm:text-sm">
            <div class="flex flex-row items-center gap-4">
                <button
                    class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svg class=" md: size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class=" stroke-cyan-950" d="M4 12H20M12 4V20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <p>
                    ► отображение модального окна изменения видимости столбцов таблицы.
                </p>
            </div>

            <div class="flex flex-row items-center gap-4">
                <button 
                    class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svgGraphIcon/>
                </button>
                <p>
                    ► отображение модального окна графиков таблицы.
                </p>
            </div>  

            <div class="flex flex-row items-center gap-4">
                <button 
                    class="inline-flex justify-center items-center size-8 text-2xl bg-indigo-200 hover:bg-indigo-100 rounded cursor-pointer">
                    <svgFilterIcon/>
                </button>
                <p>
                    ► отображение модального окна фильтров по столбцам таблицы.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
