<script setup>
    import { useRouter } from 'vue-router';
    import MasterMenu from './components/MasterMenu.vue';

    const router = useRouter();
</script>

<template>
    <MasterMenu></MasterMenu>
    <RouterView :key="router.currentRoute"></RouterView>
</template>

<style scoped>

</style>
