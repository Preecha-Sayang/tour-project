import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' 
import Homepage from '../views/Homepage.vue'
import Detailpage from '../views/Detailpage.vue'
import Mytripspage from '../views/Mytripspage.vue'
import Createtrippage from '../views/Createtrippage.vue'
import Edittrippage from '../views/Edittrippage.vue'

const routes: Array<RouteRecordRaw> = [
  { path: "/", component: Homepage },
  { path: '/detail/:id', name: 'Detail', component: Detailpage, props: true },
  { path: '/my-trips', name: 'MyTrips', component: Mytripspage, meta: { requiresAuth: true } },
  { path: '/create-trip', name: 'CreateTrip', component: Createtrippage, meta: { requiresAuth: true } },
  { path: '/edit-trip/:id', name: 'EditTrip', component: Edittrippage, props: true, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),  // ✅ เปลี่ยนจาก createWebHashHistory
  routes
})

// ✅ Navigation Guard - ตรวจสอบว่า user ได้ login หรือไม่
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    // ✅ ถ้าต้อง login แต่ยังไม่ได้ login ให้เปลี่ยนไปหน้า /
    next('/')
  } else {
    next()
  }
})

export default router