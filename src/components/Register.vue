<!-- RegisterForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'

interface FormData {
  username: string
  email: string
  password: string
  fullName: string
}

interface ApiResponse {
  message?: string
  success?: boolean
  data?: unknown
}

const formData = ref<FormData>({
  username: '',
  email: '',
  password: '',
  fullName: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

// สร้าง axios instance ดึงจาก .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

const validateForm = (): boolean => {
  if (!formData.value.username.trim()) {
    error.value = 'กรุณากรอกชื่อผู้ใช้'
    return false
  }

  if (!formData.value.email.trim()) {
    error.value = 'กรุณากรอกอีเมล'
    return false
  }

  if (!validateEmail(formData.value.email)) {
    error.value = 'รูปแบบอีเมลไม่ถูกต้อง'
    return false
  }

  if (!formData.value.fullName.trim()) {
    error.value = 'กรุณากรอกชื่อเต็ม'
    return false
  }

  if (!formData.value.password) {
    error.value = 'กรุณากรอกรหัสผ่าน'
    return false
  }

  if (!validatePassword(formData.value.password)) {
    error.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return false
  }

  return true
}

// ✅ Handle submit
const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await apiClient.post<ApiResponse>('/api/users/register', {
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password,
      fullName: formData.value.fullName.trim()
    })

    success.value = true
    error.value = ''

    // ✅ รีเซ็ตฟอร์ม
    formData.value = {
      username: '',
      email: '',
      password: '',
      fullName: ''
    }

    console.log('Register success:', response.data)
  } catch (err) {
    const axiosError = err as AxiosError<ApiResponse>

    if (axiosError.response?.status === 400) {
      error.value = axiosError.response.data?.message || 'ข้อมูลไม่ถูกต้อง'
    } else if (axiosError.response?.status === 409) {
      error.value = 'ผู้ใช้นี้มีอยู่แล้วในระบบ'
    } else if (axiosError.response?.status === 500) {
      error.value = 'เกิดข้อผิดพลาดบน server กรุณาลองใหม่'
    } else if (axiosError.message === 'Network Error') {
      error.value = 'ไม่สามารถเชื่อมต่อกับ server'
    } else {
      error.value = axiosError.response?.data?.message || 'เกิดข้อผิดพลาด: ' + err
    }

    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}

// ✅ Handle enter key
const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && !loading.value) {
    handleSubmit()
  }
}
</script>

<template>
  <div class="form-container">
    <!-- ✅ แสดงข้อความสำเร็จ -->
    <div v-if="success" class="alert alert-success">
      ✅ ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ
    </div>

    <!-- ✅ แสดงข้อความข้อผิดพลาด -->
    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <div class="form-group">
      <label>ชื่อผู้ใช้</label>
      <input
        type="text"
        v-model="formData.username"
        @keydown="handleKeyDown"
        :disabled="loading"
        placeholder="เช่น john_doe"
      />
    </div>

    <div class="form-group">
      <label>อีเมล</label>
      <input
        type="email"
        v-model="formData.email"
        @keydown="handleKeyDown"
        :disabled="loading"
        placeholder="example@email.com"
      />
    </div>

    <div class="form-group">
      <label>ชื่อเต็ม</label>
      <input
        type="text"
        v-model="formData.fullName"
        @keydown="handleKeyDown"
        :disabled="loading"
        placeholder="เช่น จอห์น โด"
      />
    </div>

    <div class="form-group">
      <label>รหัสผ่าน</label>
      <input
        type="password"
        v-model="formData.password"
        @keydown="handleKeyDown"
        :disabled="loading"
        placeholder="อย่างน้อย 6 ตัวอักษร"
      />
    </div>

    <button @click="handleSubmit" :disabled="loading" class="submit-btn">
      {{ loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน' }}
    </button>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
</style>