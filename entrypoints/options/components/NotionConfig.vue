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
        <span class="switch-text">{{ t('options.enableNotion') }}</span>
      </label>
    </div>

    <div class="form-group">
      <label>{{ t('options.notion.integrationToken') }}</label>
      <input
        type="text"
        v-model="config.integrationToken"
        :placeholder="t('options.notion.integrationTokenPlaceholder')"
      />
      <small>
        {{ t('options.notion.integrationTokenHint').split('Notion Integrations')[0] }}
        <a href="https://www.notion.so/my-integrations" target="_blank">Notion Integrations</a>
        {{ t('options.notion.integrationTokenHint').split('Notion Integrations')[1] || '' }}
      </small>
    </div>

    <div class="form-group">
      <label>{{ t('options.notion.databaseId') }}</label>
      <input
        type="text"
        v-model="config.databaseId"
        :placeholder="t('options.notion.databaseIdPlaceholder')"
      />
      <small>{{ t('options.notion.databaseIdHint') }}</small>
    </div>

    <div class="form-group">
      <label>{{ t('options.notion.advancedConfig') }}</label>
      <details style="margin-top: 8px">
        <summary style="cursor: pointer; color: #666; font-size: 13px">
          {{ t('options.notion.propertyMapping') }}
        </summary>
        <div
          style="
            margin-top: 12px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
          "
        >
          <div style="margin-bottom: 12px">
            <label style="font-size: 12px; color: #666">{{ t('options.notion.titleProperty') }}</label>
            <input
              type="text"
              v-model="config.titleProperty"
              :placeholder="t('options.notion.titlePropertyPlaceholder')"
              style="margin-top: 4px"
            />
          </div>
          <div style="margin-bottom: 12px">
            <label style="font-size: 12px; color: #666">{{ t('options.notion.contentProperty') }}</label>
            <input
              type="text"
              v-model="config.contentProperty"
              :placeholder="t('options.notion.contentPropertyPlaceholder')"
              style="margin-top: 4px"
            />
          </div>
          <div>
            <label style="font-size: 12px; color: #666">{{ t('options.notion.sourceProperty') }}</label>
            <input
              type="text"
              v-model="config.sourceProperty"
              :placeholder="t('options.notion.sourcePropertyPlaceholder')"
              style="margin-top: 4px"
            />
          </div>
        </div>
      </details>
      <small style="display: block; margin-top: 8px">
        📚 {{ t('options.notion.templateHint') }}
        <a href="https://anghunk.notion.site/2cad17511b968031a7ebeecd5e279c6a" target="_blank">
          {{ t('options.notion.templateLink') }}
        </a>
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const config = defineModel<{
  enabled: boolean;
  integrationToken: string;
  databaseId: string;
  titleProperty?: string;
  contentProperty?: string;
  sourceProperty?: string;
}>('config', { required: true });
</script>
