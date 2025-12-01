<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios, { AxiosError } from 'axios'
import LoginPopup from './LoginPopup.vue'

interface User {
  id: number
  email: string
  displayName: string | null
  username?: string
  createdAt: string
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
}

const showModal = ref(false)
const showDropdown = ref(false)
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ✅ ฟังก์ชันเช็ค token เมื่อโหลดหน้า
async function checkAuth(): Promise<void> {
  const token = localStorage.getItem('authToken')

  if (token) {
    try {
      // ถ้า backend มี endpoint /api/users/me ให้ใช้นี้
      // const response = await axios.get(`${API_URL}/api/users/me`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      // user.value = response.data

      // ถ้าเก็บข้อมูลใน localStorage ให้ใช้นี้
      const userData: User = {
        id: parseInt(localStorage.getItem('userId') || '0'),
        email: localStorage.getItem('userEmail') || '',
        displayName: localStorage.getItem('username') || null,
        createdAt: new Date().toISOString()
      }

      if (userData.email) {
        user.value = userData
      }
    } catch (err) {
      console.error('Check auth failed:', err)
      localStorage.removeItem('authToken')
      user.value = null
    }
  }
}

// เช็ค token เมื่อ component โหลด
onMounted(() => {
  checkAuth()
})

// ✅ Handle login
async function handleLogin(loginData: LoginData): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.post(`${API_URL}/api/users/login`, loginData)

    const userData = response.data.data || response.data

    // เก็บ token ใน localStorage
    if (userData.token) {
      localStorage.setItem('authToken', userData.token)
      localStorage.setItem('userId', userData.id?.toString() || '')
      localStorage.setItem('userEmail', userData.email || '')
      localStorage.setItem('username', userData.displayName || '')

      user.value = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt
      }
    }

    showModal.value = false
  } catch (err) {
    const axiosError = err as AxiosError<{ message: string }>
    error.value = axiosError.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ✅ Handle register
async function handleRegister(registerData: RegisterData): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.post(`${API_URL}/api/users/register`, registerData)

    const userData = response.data.data || response.data

    // เก็บ token ใน localStorage
    if (userData.token) {
      localStorage.setItem('authToken', userData.token)
      localStorage.setItem('userId', userData.id?.toString() || '')
      localStorage.setItem('userEmail', userData.email || '')
      localStorage.setItem('username', userData.displayName || '')

      user.value = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt
      }
    }

    showModal.value = false
  } catch (err) {
    const axiosError = err as AxiosError<{ message: string }>
    error.value = axiosError.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ✅ Handle logout
function handleLogout(): void {
  user.value = null
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('username')
  showDropdown.value = false
}

function handleCloseModal(): void {
  showModal.value = false
  error.value = ''
}

function handleTabChange(): void {
  error.value = ''
}

// ✅ Get user initial
const getUserInitial = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName.charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return '?'
})

// ✅ Get user display name
const getUserName = computed(() => {
  return user.value?.displayName || user.value?.email || 'ผู้ใช้'
})
</script>

<template>
  <div>
    <header>
      <nav>
        <div class="logo">
        <img src="/logo.png" alt="logopage" > 
          เที่ยวไหนดี
        </div>
        <ul class="nav-links">
          <li v-if="user" class="user-section">
            <!-- ✅ User Avatar with Dropdown -->
            <div class="user-info" @click="showDropdown = !showDropdown">
              <div class="user-avatar">
                {{ getUserInitial }}
              </div>
              <span class="user-name">{{ getUserName }}</span>
              <svg
                class="dropdown-icon"
                :class="{ open: showDropdown }"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path fill="currentColor" d="M8 11L3 6h10z" />
              </svg>
            </div>

            <!-- ✅ Dropdown Menu -->
            <div v-if="showDropdown" class="dropdown-menu">
              <a href="/my-trips" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                </svg>
                <span>ประวัติการเดินทาง</span>
              </a>
              <a href="/create-trip" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>สร้างการเดินทาง</span>
              </a>
              <hr class="dropdown-divider" />
              <button @click="handleLogout" class="dropdown-item logout-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </li>
          <li v-else>
            <button @click="showModal = true" class="login-btn">เข้าสู่ระบบ</button>
          </li>
        </ul>
      </nav>
    </header>



    <!-- ✅ Login Popup -->
    <LoginPopup
      :show="showModal"
      :error="error"
      :loading="loading"
      @close="handleCloseModal"
      @tab-change="handleTabChange"
      @login="handleLogin"
      @register="handleRegister"
    />
  </div>
</template>

<style scoped>
header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.login-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.user-section {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-info:hover {
  background: #e5e7eb;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
  color: #374151;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  transition: transform 0.3s;
  color: #6b7280;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

/* ✅ Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  overflow: hidden;
  margin-top: 12px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #667eea;
}

.dropdown-item svg {
  flex-shrink: 0;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: #fee2e2;
  color: #dc2626;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.success-message {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 48px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.success-message h2 {
  font-size: 32px;
  color: #10b981;
  margin-bottom: 16px;
}

.success-message p {
  font-size: 18px;
  color: #6b7280;
}

.logo img {
  height: 60px;  /* ขนาดโลโก้ตามที่ต้องการ */
  width: auto;   /* รักษาสัดส่วน */
  display: block;
}
</style>