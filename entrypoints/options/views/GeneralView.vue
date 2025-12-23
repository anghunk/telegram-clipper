<template>
  <div>
    <div class="content-header">
      <h2>{{ t('options.general.title') }}</h2>
      <p class="description">{{ t('options.general.description') }}</p>
    </div>

    <div class="config-form">
      <div class="empty-state">
        <span class="empty-icon">⚙️</span>
        <p class="empty-text">{{ t('options.general.moreSettingsComing') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
