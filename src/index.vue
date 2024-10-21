<script setup lang="ts">
import { onMounted, ref } from "vue";

import { app, navigation } from "./app";
import { GameWorld } from "./screens/GameSreen";

const appRef = ref<HTMLElement>();

onMounted(async () => {
  if (appRef.value) {
    appRef.value.append(app.view);
    (globalThis as any).__PIXI_APP__ = app;

    navigation.showScreen(GameWorld);
  }
});
</script>

<template>
  <div ref="appRef"></div>
</template>
