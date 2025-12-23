<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>{{ t('options.title') }}</h1>
    </div>

    <div class="sidebar-section">
      <h3>{{ t('options.platformManagement') }}</h3>
      <div class="platform-list">
        <router-link
          v-for="platform in platforms"
          :key="platform.meta.id"
          :to="{ name: platform.meta.id }"
          custom
          v-slot="{ navigate, isActive }"
        >
          <button
            :class="['platform-item', { active: isActive }]"
            @click="navigate"
          >
            <div class="platform-info">
              <span class="platform-name">{{ platform.meta.name }}</span>
            </div>
            <div class="platform-status">
              <span
                v-if="platformConfigs[platform.meta.id]?.enabled"
                class="status-badge enabled"
                :title="t('common.enabled')"
              >
                {{ t('common.on') }}
              </span>
              <span v-else class="status-badge disabled" :title="t('common.disabled')">
                {{ t('common.off') }}
              </span>
            </div>
          </button>
        </router-link>
      </div>
    </div>

    <!-- 常规设置入口 -->
    <div class="sidebar-section">
      <h3>{{ t('options.general.title') }}</h3>
      <div class="platform-list">
        <router-link
          :to="{ name: 'general' }"
          custom
          v-slot="{ navigate, isActive }"
        >
          <button
            :class="['platform-item', { active: isActive }]"
            @click="navigate"
          >
            <div class="platform-info">
              <span class="platform-name">{{ t('options.general.title') }}</span>
            </div>
          </button>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getAllPlatforms, type AllPlatformConfigs } from '@/lib/platforms';

const { t } = useI18n();

defineProps<{
  platformConfigs: AllPlatformConfigs;
}>();

const platforms = getAllPlatforms();
</script>
