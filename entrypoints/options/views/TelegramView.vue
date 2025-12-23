<template>
  <div>
    <div class="content-header">
      <h2>{{ platform?.meta.name }}</h2>
      <p class="description">{{ platform?.meta.description }}</p>

      <div class="tutorial-link">
        <a href="https://clipper-hub.netlify.app/" target="_blank">
          {{ t('options.tutorial') }}
        </a>
      </div>
    </div>

    <TelegramConfig v-model:config="config" />

    <div class="action-bar">
      <button @click="testConnection" :disabled="isLoading" class="btn btn-secondary">
        {{ isLoading ? t('common.testing') : t('common.test') }}
      </button>
      <button @click="saveSettings" class="btn btn-primary">{{ t('options.saveSettings') }}</button>
    </div>

    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TelegramConfig from '../components/TelegramConfig.vue';
import {
  loadAllConfigs,
  saveAllConfigs,
  getAllPlatforms,
  testPlatformConnection,
  type AllPlatformConfigs,
  defaultConfigs,
} from '@/lib/platforms';

const { t } = useI18n();

const platformConfigs = ref<AllPlatformConfigs>({ ...defaultConfigs });
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('info');

const config = computed({
  get: () => platformConfigs.value.telegram,
  set: (value) => {
    platformConfigs.value.telegram = value;
  }
});

const platform = computed(() => 
  getAllPlatforms().find(p => p.meta.id === 'telegram')
);

onMounted(async () => {
  try {
    platformConfigs.value = await loadAllConfigs();
  } catch (error) {
    console.error(t('options.loadFailed'), error);
    showStatus(`❌ ${t('options.loadFailed')}`, 'error');
  }
});

async function testConnection() {
  isLoading.value = true;
  showStatus(t('options.testing'), 'info');

  try {
    const result = await testPlatformConnection('telegram', config.value);
    if (result.success) {
      showStatus(`✅ ${t('options.testSuccess')}`, 'success');
    } else {
      showStatus(`❌ ${t('options.testFailed')}: ${result.error || t('common.error')}`, 'error');
    }
  } catch (error: any) {
    showStatus(`❌ ${t('options.networkError')}: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function saveSettings() {
  try {
    await saveAllConfigs(platformConfigs.value);
    showStatus(`✅ ${t('options.saveSuccess')}`, 'success');
    setTimeout(() => {
      statusMessage.value = '';
    }, 3000);
  } catch (error: any) {
    showStatus(`❌ ${t('options.saveFailed')}: ${error.message}`, 'error');
  }
}

function showStatus(message: string, type: string = 'info') {
  statusMessage.value = message;
  statusType.value = type;
}
</script>
