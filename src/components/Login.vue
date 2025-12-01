<!-- LoginForm.vue -->
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

<script>
import axios from 'axios'

export default {
  name: 'LoginForm',
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      loading: false,
      error: '',
      success: false,
      apiClient: axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  },
  methods: {
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    validateForm() {
      if (!this.formData.email.trim()) {
        this.error = 'กรุณากรอกอีเมล'
        return false
      }

      if (!this.validateEmail(this.formData.email)) {
        this.error = 'รูปแบบอีเมลไม่ถูกต้อง'
        return false
      }

      if (!this.formData.password) {
        this.error = 'กรุณากรอกรหัสผ่าน'
        return false
      }

      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.error = ''
      this.success = false

      try {
        const response = await this.apiClient.post('/api/users/login', {
          email: this.formData.email.trim(),
          password: this.formData.password
        })

        // ✅ เก็บ token ใน localStorage
        // Response structure: { data: { token, id, email, displayName } } หรือ { token, id, email, displayName }
        const tokenData = response.data.data || response.data
        
        if (tokenData?.token) {
          localStorage.setItem('authToken', tokenData.token)
          localStorage.setItem('userId', (tokenData.id || tokenData.userId)?.toString() || '')
          localStorage.setItem('userEmail', tokenData.email || '')
          localStorage.setItem('username', tokenData.displayName || tokenData.username || '')
          
          this.success = true
          console.log('✅ Token saved successfully:', {
            token: tokenData.token.substring(0, 20) + '...',
            userId: tokenData.id || tokenData.userId,
            email: tokenData.email
          })
        } else {
          throw new Error('ไม่พบ token ในการตอบสนอง')
        }

        this.success = true
        this.error = ''

        // ✅ รีเซ็ตฟอร์ม
        this.formData = {
          email: '',
          password: ''
        }

        console.log('Login success:', response.data)

        // ✅ Emit event ให้ parent component
        this.$emit('login-success', response.data)

        // ✅ Redirect ไป home หรือ dashboard (ปรับตามต้องการ)
        // setTimeout(() => {
        //   window.location.href = '/dashboard'
        // }, 1000)
      } catch (err) {
        if (err.response?.status === 400) {
          this.error = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        } else if (err.response?.status === 401) {
          this.error = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        } else if (err.response?.status === 404) {
          this.error = 'ไม่พบผู้ใช้นี้ในระบบ'
        } else if (err.response?.status === 500) {
          this.error = 'เกิดข้อผิดพลาดบน server กรุณาลองใหม่'
        } else if (err.message === 'Network Error') {
          this.error = 'ไม่สามารถเชื่อมต่อกับ server'
        } else {
          this.error = err.response?.data?.message || 'เกิดข้อผิดพลาด'
        }

        console.error('Login error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

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