import { createRouter, createWebHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' 
import Homepage from '../views/Homepage.vue'
import Detailpage from '../views/Detailpage.vue'
import Mytripspage from '../views/Mytripspage.vue'
import Createtrippage from '../views/Createtrippage.vue'
import Edittrippage from '../views/Edittrippage.vue'


const routes: Array<RouteRecordRaw> = [
{ path: "/", component: Homepage },
{ path: '/detail/:id', name: 'Detail', component: Detailpage, props: true },
  { path: '/my-trips', name: 'MyTrips', component: Mytripspage },
  { path: '/create-trip', name: 'CreateTrip', component: Createtrippage },
  { path: '/edit-trip/:id', name: 'EditTrip', component: Edittrippage, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router