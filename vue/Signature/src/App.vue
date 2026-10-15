<script setup lang="ts">
import themeOverrides from './config/themeOverrides';
import Signature from '@components/Signature.vue';

</script>

<template>
    <n-config-provider inline-theme-disabled :theme-overrides="themeOverrides">
        <header class="app-title">
            <h2>Javascript Plug-in demo</h2>
        </header>
        <n-divider />
        <Signature />
    </n-config-provider>
</template>

<style scoped>
.app-title {
    min-width: 0;
    padding: 0 0.5rem;
    text-align: center;
}

.app-title h2 {
    margin: 0;
}
</style>
