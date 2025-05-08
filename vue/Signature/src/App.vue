<script setup lang="ts">
import themeOverrides from './config/themeOverrides';
import Signature from '@components/Signature.vue';

</script>

<template>
    <n-config-provider inline-theme-disabled :theme-overrides="themeOverrides">
        <n-divider>
            <h2>Javascript Plug-in demo</h2>
        </n-divider>
        <Signature />
    </n-config-provider>
</template>

<style scoped></style>
