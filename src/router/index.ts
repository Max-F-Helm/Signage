import {createRouter, createWebHistory} from 'vue-router';
import Document from '@/ui/Document.vue';
import PatchFromLink from "@/ui/PatchFromLink.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'document',
      component: Document
    },
    {
      path: '/importPatchset',
      name: 'importPatchset',
      component: PatchFromLink
    },
  ]
});

export default router;
