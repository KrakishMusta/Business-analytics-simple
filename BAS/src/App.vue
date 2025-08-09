<script setup>
    import { computed, ref, watch, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import MasterMenu from './components/MasterMenu.vue';

    const router = useRouter();
    const route = useRoute();

</script>

<template>
        <MasterMenu/>
        <RouterView :key="router.currentRoute"/>
</template>

<style scoped>

</style>
