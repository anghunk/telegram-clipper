import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.less';
import { i18n, loadLocale } from '@/lib/i18n';
import router from './router';

// 初始化应用
async function initApp() {
  // 先加载语言设置
  const locale = await loadLocale();
  i18n.global.locale.value = locale;
  
  // 再挂载应用
  const app = createApp(App);
  app.use(router);
  app.use(ElementPlus);
  app.use(i18n);
  app.mount('#app');
}

initApp();
