<script setup lang="ts">
import themeOverrides from './config/themeOverrides';
import AddText from '@components/AddText.vue';
</script>

<template>
    <n-config-provider inline-theme-disabled :theme-overrides="themeOverrides">
        <n-divider>
            <h2>Javascript Plug-in demo</h2>
        </n-divider>
        <AddText />
    </n-config-provider>
</template>

<style scoped></style>
