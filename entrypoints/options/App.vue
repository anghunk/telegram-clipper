<template>
  <div class="options-layout">
    <!-- 顶部导航栏 -->
    <AppHeader />
    
    <div class="options-container">
      <!-- 侧边栏 -->
      <Sidebar :platformConfigs="platformConfigs" />

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view @config-saved="handleConfigSaved" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from "vue";
import Sidebar from "./components/Sidebar.vue";
import AppHeader from "./components/AppHeader.vue";
import {
  loadAllConfigs,
  type AllPlatformConfigs,
  defaultConfigs,
} from "@/lib/platforms";

// 平台配置状态
const platformConfigs = ref<AllPlatformConfigs>({ ...defaultConfigs });

// 提供给子组件使用
provide('platformConfigs', platformConfigs);

async function loadConfigs() {
  try {
    platformConfigs.value = await loadAllConfigs();
  } catch (error) {
    console.error('Failed to load configs:', error);
  }
}

// 处理配置保存事件
function handleConfigSaved() {
  loadConfigs();
}

onMounted(() => {
  loadConfigs();
});
</script>

<style scoped lang="less">
@import "./style.less";
</style>
