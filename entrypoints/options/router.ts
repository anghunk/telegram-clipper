import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/telegram'
  },
  {
    path: '/telegram',
    name: 'telegram',
    component: () => import('./views/TelegramView.vue'),
    meta: { title: 'Telegram' }
  },
  {
    path: '/discord',
    name: 'discord',
    component: () => import('./views/DiscordView.vue'),
    meta: { title: 'Discord' }
  },
  {
    path: '/notion',
    name: 'notion',
    component: () => import('./views/NotionView.vue'),
    meta: { title: 'Notion' }
  },
  {
    path: '/general',
    name: 'general',
    component: () => import('./views/GeneralView.vue'),
    meta: { title: 'General' }
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
