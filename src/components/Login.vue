<!-- LoginForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'

interface FormData {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  id?: number
  userId?: number
  email: string
  displayName?: string
  username?: string
}

interface Props {
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [data: LoginResponse]
}>()

const formData = ref<FormData>({
  email: '',
  password: ''
})

const localLoading = ref(false)
const error = ref('')
const success = ref(false)

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  return  password.length >= 1
}

const validateForm = (): boolean => {
  // ✅ ตรวจสอบอีเมล (ต้องไม่ว่าง)
  if (!formData.value.email || !formData.value.email.trim()) {
    error.value = 'กรุณากรอกอีเมล'
    return false
  }

  // ✅ ตรวจสอบรูปแบบอีเมล
  if (!validateEmail(formData.value.email.trim())) {
    error.value = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@email.com)'
    return false
  }

  // ✅ ตรวจสอบรหัสผ่าน (ต้องไม่ว่าง)
  if (!formData.value.password) {
    error.value = 'กรุณากรอกรหัสผ่าน'
    return false
  }

  // ✅ ตรวจสอบความยาวรหัสผ่าน
  if (!validatePassword(formData.value.password)) {
    error.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 1 ตัวอักษร'
    return false
  }

  return true
}

const handleSubmit = async (): Promise<void> => {
  // ✅ ล้างข้อความข้อผิดพลาดเดิม
  error.value = ''

  // ✅ ตรวจสอบฟอร์ม
  if (!validateForm()) {
    return
  }

  localLoading.value = true
  success.value = false

  try {
    const response = await apiClient.post<{ data?: LoginResponse } | LoginResponse>(
      '/api/users/login',
      {
        email: formData.value.email.trim(),
        password: formData.value.password
      }
    )

    // ✅ ตรวจสอบการตอบสนอง
    const tokenData = (response.data as any).data || response.data as LoginResponse

    if (!tokenData?.token) {
      throw new Error('ไม่พบ token ในการตอบสนอง')
    }

    // ✅ ตรวจสอบอีเมล
    if (!tokenData.email) {
      throw new Error('ไม่พบอีเมลในการตอบสนอง')
    }

    // ✅ เก็บข้อมูลใน localStorage
    localStorage.setItem('authToken', tokenData.token)
    localStorage.setItem('userId', ((tokenData.id || tokenData.userId) as number)?.toString() || '')
    localStorage.setItem('userEmail', tokenData.email)
    localStorage.setItem('username', tokenData.displayName || tokenData.username || '')

    success.value = true
    error.value = ''

    console.log('✅ Login successful:', {
      token: tokenData.token.substring(0, 20) + '...',
      userId: tokenData.id || tokenData.userId,
      email: tokenData.email
    })

    // ✅ รีเซ็ตฟอร์ม
    formData.value = {
      email: '',
      password: ''
    }

    // ✅ Emit event ให้ parent component (HeaderNav) ทำการปิด modal
    emit('submit', tokenData)

  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>

    console.error('Login error:', err)

    // ✅ ตรวจสอบข้อผิดพลาด
    if (axiosError.response?.status === 400) {
      error.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    } else if (axiosError.response?.status === 401) {
      error.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    } else if (axiosError.response?.status === 404) {
      error.value = 'ไม่พบผู้ใช้นี้ในระบบ'
    } else if (axiosError.response?.status === 500) {
      error.value = 'เกิดข้อผิดพลาดบน server กรุณาลองใหม่'
    } else if (axiosError.message === 'Network Error') {
      error.value = 'ไม่สามารถเชื่อมต่อกับ server'
    } else if (axiosError.message.includes('timeout')) {
      error.value = 'หมดเวลาการเชื่อมต่อ กรุณาลองใหม่'
    } else {
      error.value = axiosError.response?.data?.message || axiosError.message || 'เกิดข้อผิดพลาด'
    }
  } finally {
    localLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <!-- ✅ แสดงข้อความสำเร็จ -->
    <div v-if="success" class="alert alert-success">
      ✅ เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...
    </div>

    <!-- ✅ แสดงข้อความข้อผิดพลาด -->
    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <div class="form-group">
      <label>อีเมล</label>
      <input
        type="email"
        v-model="formData.email"
        @keyup.enter="handleSubmit"
        :disabled="loading || localLoading"
        placeholder="example@email.com"
        required
      />
    </div>
    <div class="form-group">
      <label>รหัสผ่าน</label>
      <input
        type="password"
        v-model="formData.password"
        @keyup.enter="handleSubmit"
        :disabled="loading || localLoading"
        placeholder="กรอกรหัสผ่านของคุณ"
        required
      />
    </div>
    <button @click="handleSubmit" :disabled="loading || localLoading" class="submit-btn">
      {{ (loading || localLoading) ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
    </button>
  </div>
</template>

<template>
  <div class="form-container">
    <!-- ✅ แสดงข้อความสำเร็จ -->
    <div v-if="success" class="alert alert-success">
      ✅ เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...
    </div>

    <!-- ✅ แสดงข้อความข้อผิดพลาด -->
    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <div class="form-group">
      <label>อีเมล</label>
      <input
        type="email"
        v-model="formData.email"
        @keyup.enter="handleSubmit"
        :disabled="loading"
        placeholder="example@email.com"
        required
      />
    </div>
    <div class="form-group">
      <label>รหัสผ่าน</label>
      <input
        type="password"
        v-model="formData.password"
        @keyup.enter="handleSubmit"
        :disabled="loading"
        placeholder="กรอกรหัสผ่านของคุณ"
        required
      />
    </div>
    <button @click="handleSubmit" :disabled="loading" class="submit-btn">
      {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
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