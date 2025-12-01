<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


const { URL } = globalThis


interface TripForm {
  title: string
  description: string
  latitude: number | null
  longitude: number | null
  tags: string
}

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const form = ref<TripForm>({
  title: '',
  description: '',
  latitude: 13.7563,
  longitude: 100.5018,
  tags: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const uploadedPhotos = ref<File[]>([])
const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

// ✅ ดึง token จาก localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// ✅ Initialize Map
const initializeMap = (): void => {
  if (!mapContainer.value) return

  // สร้าง map ที่กำลังพิกัด Thailand
  map = L.map(mapContainer.value).setView([form.value.latitude || 13.7563, form.value.longitude || 100.5018], 6)

  // เพิ่ม OpenStreetMap layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // สร้าง marker ที่พิกัดเริ่มต้น
  marker = L.marker([form.value.latitude || 13.7563, form.value.longitude || 100.5018])
    .addTo(map)
    .bindPopup('พิกัดของคุณ')

  // เมื่อคลิกบน map ให้ย้าย marker
  map.on('click', (e: L.LeafletMouseEvent) => {
    form.value.latitude = Math.round(e.latlng.lat * 10000) / 10000
    form.value.longitude = Math.round(e.latlng.lng * 10000) / 10000

    if (marker) {
      marker.setLatLng([form.value.latitude, form.value.longitude])
      marker.setPopupContent(`พิกัด: ${form.value.latitude}, ${form.value.longitude}`)
    }
  })
}

// ✅ Update map marker เมื่อพิกัดเปลี่ยน
const updateMapMarker = (): void => {
  if (!map || !marker) return
  if (form.value.latitude === null || form.value.longitude === null) return

  marker.setLatLng([form.value.latitude, form.value.longitude])
  map.panTo([form.value.latitude, form.value.longitude])
}

// ✅ สร้างการเดินทาง
const createTrip = async (): Promise<void> => {
  error.value = ''

  // ✅ Validation
  if (!form.value.title.trim()) {
    error.value = 'กรุณากรอกชื่อการเดินทาง'
    return
  }

  if (!form.value.description.trim()) {
    error.value = 'กรุณากรอกคำบรรยายการเดินทาง'
    return
  }

  if (form.value.latitude === null || form.value.longitude === null) {
    error.value = 'กรุณากรอกพิกัด (ละติจูด, ลองจิจูด)'
    return
  }

  loading.value = true

  try {
    const token = getAuthToken()
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      router.push('/')
      return
    }

    // แปลง tags จาก string เป็น array
    const tagArray = form.value.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const tripData = {
      title: form.value.title,
      description: form.value.description,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      tags: tagArray,
      photos: []
    }

    const response = await axios.post(
      `${API_BASE}/api/trips`,
      tripData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const tripId = response.data.id || response.data.data?.id

    // ✅ อัพโหลดรูปภาพถ้ามี
    if (uploadedPhotos.value.length > 0) {
      const formData = new FormData()
      uploadedPhotos.value.forEach(photo => {
        formData.append('photos', photo)
      })

      await axios.post(
        `${API_BASE}/api/trips/${tripId}/photos`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
    }

    success.value = true

    // ไปที่หน้า my-trips หลังจาก 2 วินาที
    setTimeout(() => {
      router.push('/my-trips')
    }, 2000)
  } catch (err) {
    console.error('Error creating trip:', err)
    const errorMsg = (err as any).response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างการเดินทาง'
    error.value = errorMsg
  } finally {
    loading.value = false
  }
}

// ✅ Handle photo upload
const handlePhotoUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files) {
    const newFiles = Array.from(files)
    const totalFiles = uploadedPhotos.value.length + newFiles.length

    if (totalFiles > 5) {
      error.value = `สามารถอัพโหลดได้สูงสุด 5 รูปเท่านั้น (ปัจจุบัน: ${uploadedPhotos.value.length} รูป)`
      return
    }

    uploadedPhotos.value = [...uploadedPhotos.value, ...newFiles]
  }
}

// ✅ Remove photo
const removePhoto = (index: number): void => {
  uploadedPhotos.value.splice(index, 1)
}

// ✅ Cancel
const cancel = (): void => {
  router.push('/my-trips')
}

onMounted(() => {
  setTimeout(() => {
    initializeMap()
  }, 100)
})
</script>

<template>
  <div class="create-trip-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>🗺️ สร้างการเดินทางใหม่</h1>
        <p>บันทึกและแบ่งปันประสบการณ์ท่องเที่ยวของคุณ</p>
      </div>
    </section>

    <div class="container">
      <!-- Success Message -->
      <div v-if="success" class="alert alert-success">
        <div class="alert-icon">✅</div>
        <div>
          <strong>สร้างการเดินทางสำเร็จ!</strong>
          <p>กำลังเปลี่ยนไปหน้าประวัติการเดินทาง...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-error">
        <div class="alert-icon">❌</div>
        <div>
          <strong>เกิดข้อผิดพลาด</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Form -->
      <div class="form-container">
        <form @submit.prevent="createTrip">
          <!-- Title -->
          <div class="form-group">
            <label>ชื่อการเดินทาง *</label>
            <input
              type="text"
              v-model="form.title"
              placeholder="เช่น การเดินทางไปเชียงใหม่"
              maxlength="100"
              required
            />
            <span class="char-count">{{ form.title.length }}/100</span>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>คำบรรยาย *</label>
            <textarea
              v-model="form.description"
              placeholder="บรรยายรายละเอียดการเดินทางของคุณ..."
              rows="6"
              maxlength="500"
              required
            ></textarea>
            <span class="char-count">{{ form.description.length }}/500</span>
          </div>

          <!-- Map Section -->
          <div class="form-group">
            <label>เลือกพิกัดบน Map *</label>
            <div ref="mapContainer" class="map-container"></div>
            <small>💡 คลิกบน map เพื่อเลือกตำแหน่ง</small>
          </div>

          <!-- Location Coordinates -->
          <div class="form-row">
            <div class="form-group">
              <label>ละติจูด (Latitude) *</label>
              <input
                type="number"
                v-model.number="form.latitude"
                placeholder="เช่น 18.7883"
                step="0.0001"
                @change="updateMapMarker"
                required
              />
            </div>
            <div class="form-group">
              <label>ลองจิจูด (Longitude) *</label>
              <input
                type="number"
                v-model.number="form.longitude"
                placeholder="เช่น 98.9853"
                step="0.0001"
                @change="updateMapMarker"
                required
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label>แท็ก (แยกด้วยเครื่องหมายจุลภาค)</label>
            <input
              type="text"
              v-model="form.tags"
              placeholder="เช่น ชนบท, ธรรมชาติ, ขึ้น"
            />
            <small>ตัวอย่าง: ธรรมชาติ, ชนบท, วิว</small>
          </div>

          <!-- Photo Upload -->
          <div class="form-group">
            <label>รูปภาพ (สูงสุด 5 รูป)</label>
            <div class="photo-upload">
              <input
                type="file"
                id="photo-input"
                multiple
                accept="image/*"
                @change="handlePhotoUpload"
                hidden
              />
              <label for="photo-input" class="upload-btn">
                📸 เลือกรูปภาพ
              </label>
            </div>

            <!-- Preview Photos with Thumbnails -->
            <div v-if="uploadedPhotos.length > 0" class="photo-preview-container">
              <p class="photo-info">{{ uploadedPhotos.length }}/5 รูปที่เลือก</p>
              <div class="photo-grid">
                <div
                  v-for="(photo, index) in uploadedPhotos"
                  :key="index"
                  class="photo-preview-item"
                >
                  <div class="photo-preview-image">
                    <img :src="URL.createObjectURL(photo)" :alt="`Preview ${index + 1}`" />
                    <div class="photo-index">{{ index + 1 }}</div>
                  </div>
                  <div class="photo-details">
                    <p class="photo-name" :title="photo.name">{{ photo.name }}</p>
                    <p class="photo-size">{{ (photo.size / 1024).toFixed(2) }} KB</p>
                  </div>
                  <button
                    type="button"
                    @click="removePhoto(index)"
                    class="btn-remove-photo"
                    title="ลบรูปนี้"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <small v-if="uploadedPhotos.length === 0">ยังไม่มีรูปภาพ</small>
            <small v-else-if="uploadedPhotos.length === 5" class="text-warning">
              ✓ ถึงจำนวนรูปสูงสุดแล้ว
            </small>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button
              type="button"
              @click="cancel"
              class="btn btn-secondary"
              :disabled="loading"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              {{ loading ? 'กำลังสร้าง...' : '✅ สร้างการเดินทาง' }}
            </button>
          </div>
        </form>
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

.create-trip-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 60px 20px;
  color: white
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3)
}

.hero p {
  font-size: 18px;
  opacity: 0.95
}

/* Alerts */
.alert {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 30px;
  animation: slideDown 0.3s ease-out
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px)
  }
  to {
    opacity: 1;
    transform: translateY(0)
  }
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5
}

.alert-icon {
  font-size: 24px
}

.alert strong {
  display: block;
  margin-bottom: 4px
}

.alert p {
  font-size: 14px
}

/* Form Container */
.form-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2)
}

form {
  display: flex;
  flex-direction: column;
  gap: 24px
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px
}

label {
  font-weight: 600;
  color: #333;
  font-size: 14px
}

input[type="text"],
input[type="number"],
textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
}

textarea {
  resize: vertical
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right
}

small {
  color: #999;
  font-size: 12px
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px
}

/* ✅ Map Container */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  border: 2px solid #d1d5db;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
}

/* Photo Upload */
.photo-upload {
  display: flex;
  gap: 12px
}

.upload-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
  transition: all 0.3s
}

.upload-btn:hover {
  background: #e5e7eb;
  border-color: #667eea
}

/* Photo Preview Container */
.photo-preview-container {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb
}

.photo-info {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px
}

.photo-preview-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative
}

.photo-preview-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15)
}

.photo-preview-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f3f4f6;
  position: relative
}

.photo-preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover
}

.photo-index {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #667eea;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600
}

.photo-details {
  padding: 8px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between
}

.photo-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0
}

.photo-size {
  font-size: 11px;
  color: #999;
  margin: 4px 0 0 0
}

.btn-remove-photo {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 28px;
  height: 28px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0
}

.photo-preview-item:hover .btn-remove-photo {
  opacity: 1
}

.btn-remove-photo:hover {
  background: #991b1b;
  transform: scale(1.1)
}

.text-warning {
  color: #d97706;
  font-weight: 600
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  flex: 1
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3)
}

.btn-secondary {
  background: #f3f4f6;
  color: #333
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px
  }

  .form-container {
    padding: 20px
  }

  .form-row {
    grid-template-columns: 1fr
  }

  .form-actions {
    flex-direction: column
  }

  .map-container {
    height: 300px
  }
}
</style>