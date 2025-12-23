<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo-area">
        <img
          src="https://github.com/anghunk/clipper-hub/raw/main/public/icon/128.png?raw=true"
          alt=""
        />
        <h1>{{ t("options.title") }}</h1>
      </div>
    </div>

    <div class="header-right">
      <!-- 语言切换下拉菜单 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <el-button>
          <span class="lang-text">{{ currentLanguageLabel }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="auto" :disabled="currentLocale === null">
              {{ t("options.general.followBrowser") }}
            </el-dropdown-item>
            <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">
              简体中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import { switchLocale, clearLocale, type Locale } from '@/lib/i18n';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElIcon, ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';

// 自定义地球图标组件
const GlobeFilled = {
  name: 'GlobeFilled',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
      h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
    ]);
  }
};

const { t } = useI18n();
const browserAPI = browser;

const currentLocale = ref<Locale | null>(null);

// 计算当前语言显示标签
const currentLanguageLabel = computed(() => {
  if (currentLocale.value === null) {
    return t('options.general.followBrowser');
  } else if (currentLocale.value === 'zh-CN') {
    return t('options.general.chinese');
  } else if (currentLocale.value === 'en-US') {
    return t('options.general.english');
  }
  return t('options.general.followBrowser');
});

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

async function handleLanguageChange(command: string) {
  const newLocale = command === 'auto' ? null : (command as Locale);

  currentLocale.value = newLocale;

  if (newLocale === null) {
    await clearLocale();
  } else {
    await switchLocale(newLocale);
  }

  ElMessage.success(t('options.saveSuccess'));
}
</script>

<style scoped lang="less">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
}

h1 {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.lang-text {
  margin: 0 4px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .app-header {
    height: 52px;
    padding: 0 16px;
  }

  h1 {
    font-size: 16px;
  }

  .logo-area img {
    width: 24px;
    height: 24px;
  }

  .lang-text {
    display: none;
  }

  .el-icon--right {
    display: none;
  }
}

@media (max-width: 480px) {
  .app-header {
    height: 48px;
    padding: 0 12px;
  }

  h1 {
    font-size: 15px;
  }

  .logo-area {
    gap: 6px;

    img {
      width: 22px;
      height: 22px;
    }
  }
}
</style>
