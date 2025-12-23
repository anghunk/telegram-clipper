<template>
  <div class="config-form">
    <div class="form-group">
      <label>{{ t('options.general.language') }}</label>
      <select 
        class="language-select" 
        :value="currentLocale ?? 'auto'" 
        @change="handleLanguageChange"
      >
        <option value="auto">🌐 {{ t('options.general.followBrowser') }}</option>
        <option value="zh-CN">🇨🇳 {{ t('options.general.chinese') }}</option>
        <option value="en-US">🇬🇧 {{ t('options.general.english') }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { switchLocale, clearLocale, type Locale } from '@/lib/i18n';

const { t } = useI18n();
const browserAPI = browser;

const emit = defineEmits<{
  (e: 'status', message: string, type: string): void;
}>();

const currentLocale = ref<Locale | null>(null);

onMounted(() => {
  loadLanguageSettings();
});

async function loadLanguageSettings() {
  try {
    const result = await browserAPI.storage.local.get('locale');
    if (result.locale) {
      currentLocale.value = result.locale as Locale;
    } else {
      currentLocale.value = null;
    }
  } catch (error) {
    console.error('Failed to load language settings:', error);
  }
}

async function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  const newLocale = value === 'auto' ? null : (value as Locale);
  
  currentLocale.value = newLocale;
  
  if (newLocale === null) {
    await clearLocale();
  } else {
    await switchLocale(newLocale);
  }
  
  emit('status', `✅ ${t('options.saveSuccess')}`, 'success');
}
</script>

<style scoped>
.language-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 20px;
}

.language-select:focus {
  outline: none;
  border-color: #1976d2;
}

.language-select:hover {
  border-color: #1976d2;
}
</style>
