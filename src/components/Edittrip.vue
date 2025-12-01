<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

interface TripForm {
  title: string
  description: string
  latitude: number | null
  longitude: number | null
  tags: string
}

const router = useRouter()
const route = useRoute()
const tripId = route.params.id as string

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const form = ref<TripForm>({
  title: '',
  description: '',
  latitude: null,
  longitude: null,
  tags: ''
})

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const success = ref(false)
const uploadedPhotos = ref<File[]>([])
const existingPhotos = ref<string[]>([])

// ✅ ดึง token จาก localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// ✅ ดึงข้อมูลการเดินทาง
const fetchTrip = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  try {
    const token = getAuthToken()
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      router.push('/')
      return
    }

    const response = await axios.get(
      `${API_BASE}/api/trips/${tripId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const trip = response.data.data || response.data

    form.value = {
      title: trip.title || '',
      description: trip.description || '',
      latitude: trip.latitude,
      longitude: trip.longitude,
      tags: (trip.tags && Array.isArray(trip.tags)) ? trip.tags.join(', ') : ''
    }

    existingPhotos.value = trip.photos || []
  } catch (err) {
    console.error('Error fetching trip:', err)
    error.value = 'ไม่พบการเดินทางนี้'
  } finally {
    loading.value = false
  }
}

// ✅ อัพเดตการเดินทาง
const updateTrip = async (): Promise<void> => {
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

  submitting.value = true

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
      latitude: parseFloat(form.value.latitude.toString()),
      longitude: parseFloat(form.value.longitude.toString()),
      tags: tagArray,
      photos: existingPhotos.value
    }

    await axios.put(
      `${API_BASE}/api/trips/${tripId}`,
      tripData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // ✅ อัพโหลดรูปภาพใหม่ถ้ามี
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
    console.error('Error updating trip:', err)
    const errorMsg = (err as any).response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขการเดินทาง'
    error.value = errorMsg
  } finally {
    submitting.value = false
  }
}

// ✅ Handle photo upload
const handlePhotoUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files) {
    uploadedPhotos.value = Array.from(files)
  }
}

// ✅ Remove new photo
const removeNewPhoto = (index: number): void => {
  uploadedPhotos.value.splice(index, 1)
}

// ✅ Remove existing photo
const removeExistingPhoto = async (photoUrl: string): Promise<void> => {
  if (!confirm('คุณแน่ใจหรือว่าต้องการลบรูปภาพนี้?')) {
    return
  }

  try {
    const token = getAuthToken()
    if (!token) {
      error.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }

    await axios.delete(
      `${API_BASE}/api/trips/${tripId}/photos`,
      {
        params: { photoUrl },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    existingPhotos.value = existingPhotos.value.filter(p => p !== photoUrl)
  } catch (err) {
    console.error('Error deleting photo:', err)
    alert('เกิดข้อผิดพลาดในการลบรูปภาพ')
  }
}

// ✅ Cancel
const cancel = (): void => {
  router.push('/my-trips')
}

onMounted(() => {
  fetchTrip()
})
</script>

<template>
  <div class="edit-trip-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>✏️ แก้ไขการเดินทาง</h1>
        <p>อัพเดตรายละเอียดการเดินทางของคุณ</p>
      </div>
    </section>

    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Success Message -->
      <div v-else-if="success" class="alert alert-success">
        <div class="alert-icon">✅</div>
        <div>
          <strong>อัพเดตการเดินทางสำเร็จ!</strong>
          <p>กำลังเปลี่ยนไปหน้าประวัติการเดินทาง...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-else-if="error && !loading" class="alert alert-error">
        <div class="alert-icon">❌</div>
        <div>
          <strong>เกิดข้อผิดพลาด</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="form-container">
        <form @submit.prevent="updateTrip">
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

          <!-- Location -->
          <div class="form-row">
            <div class="form-group">
              <label>ละติจูด (Latitude) *</label>
              <input
                type="number"
                v-model.number="form.latitude"
                placeholder="เช่น 18.7883"
                step="0.0001"
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

          <!-- Existing Photos -->
          <div v-if="existingPhotos.length > 0" class="form-group">
            <label>รูปภาพที่มีอยู่</label>
            <div class="existing-photos">
              <div
                v-for="(photo, index) in existingPhotos"
                :key="index"
                class="photo-item"
              >
                <img :src="photo" :alt="`Photo ${index + 1}`" class="photo-thumbnail" />
                <button
                  type="button"
                  @click="removeExistingPhoto(photo)"
                  class="btn-remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Photo Upload -->
          <div class="form-group">
            <label>เพิ่มรูปภาพใหม่</label>
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

            <!-- Preview New Photos -->
            <div v-if="uploadedPhotos.length > 0" class="photo-preview">
              <div
                v-for="(photo, index) in uploadedPhotos"
                :key="index"
                class="photo-item-list"
              >
                <div class="photo-name">{{ photo.name }}</div>
                <button
                  type="button"
                  @click="removeNewPhoto(index)"
                  class="btn-remove"
                >
                  ✕
                </button>
              </div>
            </div>
            <p class="photo-count">{{ uploadedPhotos.length }} รูปใหม่ที่เลือก</p>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button
              type="button"
              @click="cancel"
              class="btn btn-secondary"
              :disabled="submitting"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting"
            >
              {{ submitting ? 'กำลังบันทึก...' : '✅ บันทึกการเดินทาง' }}
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

.edit-trip-page {
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

/* Existing Photos */
.existing-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f3f4f6
}

.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover
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

.photo-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px
}

.photo-item-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb
}

.photo-name {
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.btn-remove {
  padding: 4px 8px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s
}

.btn-remove:hover {
  background: #fecaca
}

.photo-count {
  font-size: 12px;
  color: #999
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

  .existing-photos {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))
  }
}
</style>