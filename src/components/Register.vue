<!-- RegisterForm.vue -->
<template>
  <div class="form-container">
    <div class="form-group">
      <label>ชื่อผู้ใช้</label>
      <input
        type="text"
        v-model="formData.username"
        @keyup.enter="handleSubmit"
        required
      />
    </div>
    <div class="form-group">
      <label>อีเมล</label>
      <input
        type="email"
        v-model="formData.email"
        @keyup.enter="handleSubmit"
        required
      />
    </div>
    <div class="form-group">
      <label>ชื่อเต็ม</label>
      <input
        type="text"
        v-model="formData.fullName"
        @keyup.enter="handleSubmit"
        required
      />
    </div>
    <div class="form-group">
      <label>รหัสผ่าน</label>
      <input
        type="password"
        v-model="formData.password"
        @keyup.enter="handleSubmit"
        required
      />
    </div>
    <button @click="handleSubmit" :disabled="loading" class="submit-btn">
      {{ loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  props: {
    loading: Boolean
  },
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
        fullName: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      if (this.formData.username && this.formData.email && 
          this.formData.password && this.formData.fullName) {
        this.$emit('submit', this.formData);
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
</style>