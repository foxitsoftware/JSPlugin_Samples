<script setup lang="ts">
import themeOverrides from './config/themeOverrides';
import AddCategory from '@components/SearchText.vue';

</script>

<template>
    <n-config-provider inline-theme-disabled :theme-overrides="themeOverrides">
        <n-divider>
            <h2>Javascript Plug-in demo</h2>
        </n-divider>
        <AddCategory />
    </n-config-provider>
</template>

<style scoped></style>
