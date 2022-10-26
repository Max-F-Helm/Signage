import { createRouter, createWebHistory } from 'vue-router';
import Document from '@/ui/Document.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'document',
      component: Document
    },
  ]
});

export default router;
