import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: { name: 'ExcelToJson' },
  },
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
  {
    path: '/AutoKeyInExcel',
    name: 'AutoKeyInExcel',
    component: () => import('./pages/AutoKeyInExcel.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})
