<!-- AuthModal.vue -->

<script>
import Login from './Login.vue';
import Register from './Register.vue';

export default {
  name: 'AuthModal',
  components: {
    Login,
    Register
  },
  props: {
    show: Boolean,
    error: String,
    loading: Boolean
  },
  data() {
    return {
      isLogin: true
    }
  },
  methods: {
    switchTab(isLogin) {
      this.isLogin = isLogin;
      this.$emit('tab-change', isLogin);
    }
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      
      <div class="modal-body">
        <div class="tabs">
          <button
            @click="switchTab(true)"
            :class="['tab', { active: isLogin }]"
          >
            เข้าสู่ระบบ
          </button>
          <button
            @click="switchTab(false)"
            :class="['tab', { active: !isLogin }]"
          >
            ลงทะเบียน
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <Login
          v-if="isLogin"
          :loading="loading"
          @submit="$emit('login', $event)"
        />
        <Register
          v-else
          :loading="loading"
          @submit="$emit('register', $event)"
        />
      </div>
    </div>
  </div>
</template>



<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 448px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #4b5563;
}

.modal-body {
  padding: 32px;
}

.tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab:hover:not(.active) {
  color: #4b5563;
}

.error-message {
  margin-bottom: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}
</style>