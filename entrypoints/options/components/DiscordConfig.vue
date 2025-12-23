<template>
  <div class="config-form">
    <div class="form-group">
      <label class="switch-label">
        <input
          type="checkbox"
          v-model="config.enabled"
          class="switch-input"
        />
        <span class="switch-slider"></span>
        <span class="switch-text">{{ t('options.enableDiscord') }}</span>
      </label>
    </div>

    <div class="form-group">
      <label>{{ t('options.discord.webhookUrl') }}</label>
      <input
        type="text"
        v-model="config.webhookUrl"
        :placeholder="t('options.discord.webhookUrlPlaceholder')"
      />
      <small>{{ t('options.discord.webhookUrlHint') }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const config = defineModel<{
  enabled: boolean;
  webhookUrl: string;
}>('config', { required: true });
</script>
