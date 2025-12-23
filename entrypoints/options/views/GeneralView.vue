<template>
  <div>
    <div class="content-header">
      <h2>{{ t('options.general.title') }}</h2>
      <p class="description">{{ t('options.general.title') }}</p>
    </div>

    <LanguageSettings @status="showStatus" />

    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSettings from '../components/LanguageSettings.vue';

const { t } = useI18n();

const statusMessage = ref('');
const statusType = ref('info');

function showStatus(message: string, type: string = 'info') {
  statusMessage.value = message;
  statusType.value = type;
  
  setTimeout(() => {
    statusMessage.value = '';
  }, 2000);
}
</script>
