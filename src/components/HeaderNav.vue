<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import LoginPopup from './LoginPopup.vue';

const showModal = ref(false);
const user = ref(null);
const loading = ref(false);
const error = ref('');

const API_URL = 'http://localhost:8080/api';

// ฟังก์ชันเช็ค token เมื่อโหลดหน้า
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      user.value = response.data;
    } catch (err) {
      console.error('Check auth failed:', err);
      localStorage.removeItem('token');
    }
  }
}

// เช็ค token เมื่อ component โหลด
onMounted(() => {
  checkAuth();
});

async function handleLogin(loginData) {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, loginData);
    
    user.value = response.data;
    
    // เก็บ token ใน localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}

async function handleRegister(registerData) {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.post(`${API_URL}/users/register`, registerData);
    
    user.value = response.data;
    
    // เก็บ token ใน localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    showModal.value = false;
  } catch (err) {
    error.value = err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}

function handleLogout() {
  user.value = null;
  localStorage.removeItem('token');
}

function handleCloseModal() {
  showModal.value = false;
  error.value = '';
}

function handleTabChange() {
  error.value = '';
}

const getUserInitial = () => {
  if (user.value?.username) {
    return user.value.username.charAt(0).toUpperCase();
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase();
  }
  return '';
}
</script>

<template>
  <div>
    <header>
      <nav>
        <div class="logo">เที่ยวไหนดี</div>
        <ul class="nav-links">
          <li v-if="user" class="user-section">
            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitial() }}
              </div>
              <span class="user-name">{{ user.username || user.email }}</span>
            </div>
            <button @click="handleLogout" class="logout-btn">
              ออกจากระบบ
            </button>
          </li>
          <li v-else>
            <a href="#" @click.prevent="showModal = true">เข้าสู่ระบบ</a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="header-content">
      <div v-if="user" class="success-message">
        <h2>✅ เข้าสู่ระบบสำเร็จ!</h2>
        <p>ยินดีต้อนรับคุณ {{ user.username || user.email }}</p>
      </div>
    </div>

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
}

.nav-links {
  display: flex;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 9999px;
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
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.logout-btn {
  padding: 8px 16px;
  color: #667eea;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.logout-btn:hover {
  color: #764ba2;
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

.welcome-container {
  text-align: center;
  padding: 80px 0;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
}

.welcome-text {
  font-size: 20px;
  color: #6b7280;
}
</style>