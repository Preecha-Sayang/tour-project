<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface Trip {
  id: number
  title: string
  description: string
  tags: string[]
  photos: string[]
  authorId: number
  createdAt: string
}

const trips = ref<Trip[]>([])
const loading = ref(true)
const error = ref('')

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const router = useRouter()

// ✅ ดึง token จาก localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// ✅ ดึงข้อมูล trips ของผู้ใช้
const fetchMyTrips = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  try {
    const token = getAuthToken()
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      router.push('/')
      return
    }

    // ดึง userId จาก localStorage
    const userId = localStorage.getItem('userId')

    // ดึงข้อมูลทั้งหมด แล้วค่อยกรอง
    const response = await axios.get<Trip[]>(`${API_BASE}/api/trips`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // ค้นหา trips ของผู้ใช้ปัจจุบัน
    trips.value = response.data.filter(trip => trip.authorId === parseInt(userId || '0'))

    if (trips.value.length === 0) {
      error.value = 'ยังไม่มีการเดินทางที่สร้าง'
    }
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
  } finally {
    loading.value = false
  }
}

// ✅ ลบการเดินทาง
const deleteTrip = async (tripId: number, event: Event): Promise<void> => {
  event.stopPropagation()

  if (!confirm('คุณแน่ใจหรือว่าต้องการลบการเดินทางนี้?')) {
    return
  }

  try {
    const token = getAuthToken()
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    await axios.delete(`${API_BASE}/api/trips/${tripId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // ลบออกจาก list
    trips.value = trips.value.filter(trip => trip.id !== tripId)

    if (trips.value.length === 0) {
      error.value = 'ยังไม่มีการเดินทางที่สร้าง'
    }
  } catch (err) {
    console.error('Error deleting trip:', err)
    alert('เกิดข้อผิดพลาดในการลบ')
  }
}

// ✅ ไปหน้า edit
const editTrip = (trip: Trip): void => {
  router.push(`/edit-trip/${trip.id}`)
}

// ✅ ไปหน้า detail
const viewTrip = (trip: Trip): void => {
  router.push(`/detail/${trip.id}`)
}

// ✅ Utilities
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchMyTrips()
})
</script>

<template>
  <div class="my-trips-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>📍 ประวัติการเดินทางของฉัน</h1>
          <p>จัดการและแบ่งปันการเดินทางที่น่าจดจำ</p>
          <router-link to="/create-trip" class="create-btn">
            ➕ สร้างการเดินทางใหม่
          </router-link>
        </div>
      </div>
    </section>

    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">😔</div>
        <p>{{ error }}</p>
        <router-link to="/create-trip" class="create-btn-alt">
          สร้างการเดินทางแรกของคุณ
        </router-link>
      </div>

      <!-- Trips List -->
      <div v-else class="trips-grid">
        <div
          class="trip-card"
          v-for="trip in trips"
          :key="trip.id"
          @click="viewTrip(trip)"
        >
          <!-- Card Image -->
          <div
            class="card-image"
            :style="{
              background: trip.photos && trip.photos.length > 0
                ? `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url('${trip.photos[0]}')`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          >
            <div v-if="!trip.photos || trip.photos.length === 0" class="no-image-text">
              ไม่มีรูปภาพ
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <h3 class="card-title">{{ trip.title }}</h3>
            <p class="card-description">{{ truncateText(trip.description, 100) }}</p>

            <!-- Tags -->
            <div v-if="trip.tags && trip.tags.length > 0" class="card-tags">
              <span class="tag" v-for="tag in trip.tags.slice(0, 3)" :key="tag">
                {{ tag }}
              </span>
              <span v-if="trip.tags.length > 3" class="tag-more">
                +{{ trip.tags.length - 3 }}
              </span>
            </div>

            <!-- Date -->
            <p class="card-date">📅 {{ formatDate(trip.createdAt) }}</p>

            <!-- Action Buttons -->
            <div class="card-actions">
              <button @click.stop="editTrip(trip)" class="btn-edit">
                ✏️ แก้ไข
              </button>
              <button @click.stop="deleteTrip(trip.id, $event)" class="btn-delete">
                🗑️ ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box
}

.my-trips-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 60px 20px;
  color: white
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3)
}

.hero p {
  font-size: 20px;
  opacity: 0.95
}

.create-btn {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 12px 32px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2)
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3)
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: white
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

.loading p {
  font-size: 18px
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  margin-top: 40px
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px
}

.error-state p {
  font-size: 20px;
  color: #6b7280;
  margin-bottom: 30px
}

.create-btn-alt {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 32px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s
}

.create-btn-alt:hover {
  transform: translateY(-2px)
}

/* Trips Grid */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 40px
}

.trip-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3)
}

.card-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center
}

.no-image-text {
  color: white;
  font-size: 18px
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.3
}

.card-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  flex-grow: 1
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px
}

.tag {
  display: inline-block;
  background: #f0f0f0;
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500
}

.tag-more {
  display: inline-block;
  background: #f0f0f0;
  color: #999;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500
}

.card-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 15px
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px
}

.btn-edit {
  background: #667eea;
  color: white
}

.btn-edit:hover {
  background: #5568d3;
  transform: translateY(-2px)
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626
}

.btn-delete:hover {
  background: #fecaca;
  transform: translateY(-2px)
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px
  }

  .trips-grid {
    grid-template-columns: 1fr
  }

  .card-actions {
    flex-direction: column
  }
}
</style>