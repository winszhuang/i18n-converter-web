import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/ExcelToJson',
    name: 'ExcelToJson',
    component: () => import('./pages/ExcelToJson.vue'),
  },
  {
    path: '/JsonToExcel',
    name: 'JsonToExcel',
    component: () => import('./pages/JsonToExcel.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})
