<script setup>
    import { ref, watch, onMounted } from 'vue';

    const props = defineProps({
        placeholder: String,
        modelValue: String,
        disabled: Boolean
    });

    const emit = defineEmits(['update:modelValue']);

    const dateValue = ref(props.modelValue || '');

    const formatForInput = (value) => {
        if (!value) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        return new Date(value).toISOString().split('T')[0];
    };

    watch(dateValue, (newValue) => {
        emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newVal) => {
        dateValue.value = formatForInput(newVal);
    });

    onMounted(() => {
        dateValue.value = formatForInput(props.modelValue);
    });
</script>

<template>
    <div class="flex">
        <input
            v-model="dateValue"
            class="date-input"
            type="date"
            :disabled="disabled"
            :placeholder="placeholder"
        />
        <span v-if="disabled" class="self-center font-bold">Состояние доступно только на текущую дату.</span>
    </div>
</template>

<style scoped>
    @import "tailwindcss";

    @layer components {
        .date-input {
            @apply box-border align-bottom border-b border-cyan-950 focus:outline-none pl-2 py-1;
            min-width: 150px;
        }

        .date-input:disabled {
            opacity: 1;
        }
    }
</style>
