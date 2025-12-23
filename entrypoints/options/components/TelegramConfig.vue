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
        <span class="switch-text">{{ t('options.enableTelegram') }}</span>
      </label>
    </div>

    <div class="form-group">
      <label>{{ t('options.telegram.botToken') }}</label>
      <input
        type="text"
        v-model="config.botToken"
        :placeholder="t('options.telegram.botTokenPlaceholder')"
      />
      <small>
        {{ t('options.telegram.botTokenHint').replace('@BotFather', '') }}
        <a href="https://t.me/BotFather" target="_blank">@BotFather</a>
        {{ t('options.telegram.botTokenHint').includes('获取') ? '获取 Token' : '' }}
      </small>
    </div>

    <div class="form-group">
      <label>{{ t('options.telegram.channelId') }}</label>
      <input
        type="text"
        v-model="config.channelId"
        :placeholder="t('options.telegram.channelIdPlaceholder')"
      />
      <small>{{ t('options.telegram.channelIdHint') }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const config = defineModel<{
  enabled: boolean;
  botToken: string;
  channelId: string;
}>('config', { required: true });
</script>
