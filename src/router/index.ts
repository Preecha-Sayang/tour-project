import { createRouter, createWebHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' 
import Homepage from '../views/Homepage.vue'
import Detailpage from '../views/Detailpage.vue'


const routes: Array<RouteRecordRaw> = [
{ path: "/", component: Homepage },
{ path: '/detail/:id', name: 'Detail', component: Detailpage, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router