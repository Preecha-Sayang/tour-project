import { createRouter, createWebHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' 
import Homepage from '../views/Homepage.vue'


const routes: Array<RouteRecordRaw> = [
{ path: "/", component: Homepage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router