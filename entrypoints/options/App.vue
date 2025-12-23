<template>
  <div class="options-container">
    <!-- 侧边栏 -->
    <Sidebar :platformConfigs="platformConfigs" />

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "./components/Sidebar.vue";
import {
  loadAllConfigs,
  type AllPlatformConfigs,
  defaultConfigs,
} from "@/lib/platforms";

// 平台配置状态
const platformConfigs = ref<AllPlatformConfigs>({ ...defaultConfigs });

onMounted(async () => {
  try {
    platformConfigs.value = await loadAllConfigs();
  } catch (error) {
    console.error('Failed to load configs:', error);
  }
});
</script>

<style scoped lang="less">
@import "./style.less";
</style>
