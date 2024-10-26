<script setup lang="ts">
import { onMounted, ref } from "vue";

import { app, navigation } from "./app";
import { LoadScreen } from "./screens/LoadScreen";

const appRef = ref<HTMLElement>();

onMounted(async () => {
  if (appRef.value) {
    appRef.value.append(app.view);
    (globalThis as any).__PIXI_APP__ = app;

    navigation.showScreen(LoadScreen);
  }
});
</script>

<template>
  <div ref="appRef"></div>
</template>
