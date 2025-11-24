<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface Trip {
  id: number;
  title: string;
  description: string;
  tags: string[];
  photos: string[];
  latitude?: number;
  longitude?: number;
}

const route = useRoute();
const router = useRouter();
const idParam = route.params.id;
const id = Number(idParam);

const trip = ref<Trip | null>(null);
const loading = ref(true);
const selectedPhoto = ref(0);

const API_BASE = "https://server-springboot-1.onrender.com/api/trips";

const fetchDetail = async () => {
  if (isNaN(id)) {
    console.error('Invalid id param:', idParam);
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await axios.get<Trip>(`${API_BASE}/${id}`);
    trip.value = res.data;
  } catch (err) {
    console.error('Error fetching detail:', err);
    trip.value = null;
  } finally {
    loading.value = false;
  }
};

const mapUrl = computed(() => {
  if (!trip.value?.latitude || !trip.value?.longitude) return '';
  return `https://www.openstreetmap.org/export/embed.html?bbox=${trip.value.longitude - 0.01},${trip.value.latitude - 0.01},${trip.value.longitude + 0.01},${trip.value.latitude + 0.01}&layer=mapnik&marker=${trip.value.latitude},${trip.value.longitude}`;
});

const googleMapsUrl = computed(() => {
  if (!trip.value?.latitude || !trip.value?.longitude) return '';
  return `https://www.google.com/maps?q=${trip.value.latitude},${trip.value.longitude}`;
});

onMounted(() => {
  fetchDetail();
});

const goBack = () => {
  router.back();
};

const selectPhoto = (index: number) => {
  selectedPhoto.value = index;
};
</script>

<template>
  <div class="detail-container">
    <!-- Header with back button -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>ย้อนกลับ</span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- No data state -->
    <div v-else-if="!trip" class="no-data">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>ไม่พบข้อมูลรายละเอียด</h2>
      <p>ขออภัย ไม่สามารถโหลดข้อมูลได้</p>
    </div>

    <!-- Trip detail -->
    <div v-else class="detail-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="main-image-wrapper">
          <div 
            v-if="trip.photos && trip.photos.length > 0"
            class="main-image"
            :style="{ backgroundImage: `url('${trip.photos[selectedPhoto]}')` }"
          >
            <div class="image-overlay"></div>
          </div>
          <div v-else class="no-image">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p>ไม่มีรูปภาพ</p>
          </div>
        </div>

        <!-- Photo thumbnails -->
        <div v-if="trip.photos && trip.photos.length > 1" class="thumbnails">
          <div 
            v-for="(p, i) in trip.photos" 
            :key="i" 
            class="thumb"
            :class="{ active: selectedPhoto === i }"
            :style="{ backgroundImage: `url('${p}')` }"
            @click="selectPhoto(i)"
          ></div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <div class="title-section">
          <h1 class="title">{{ trip.title }}</h1>
          <div v-if="trip.tags && trip.tags.length" class="tags">
            <span v-for="(t, i) in trip.tags" :key="i" class="tag">
              #{{ t }}
            </span>
          </div>
        </div>

        <div class="description-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            รายละเอียด
          </h3>
          <p class="description">{{ trip.description }}</p>
        </div>

        <!-- Location Section -->
        <div v-if="trip.latitude && trip.longitude" class="location-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ตำแหน่งที่ตั้ง
          </h3>
          
          <div class="coordinates">
            <div class="coord-item">
              <span class="coord-label">ละติจูด:</span>
              <span class="coord-value">{{ trip.latitude.toFixed(6) }}°</span>
            </div>
            <div class="coord-item">
              <span class="coord-label">ลองจิจูด:</span>
              <span class="coord-value">{{ trip.longitude.toFixed(6) }}°</span>
            </div>
          </div>

          <div class="map-container">
            <iframe
              :src="mapUrl"
              frameborder="0"
              class="map-frame"
            ></iframe>
          </div>

          <a 
            :href="googleMapsUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="map-link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            เปิดใน Google Maps
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.loading {
  max-width: 1200px;
  margin: 100px auto;
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-data {
  max-width: 1200px;
  margin: 100px auto;
  text-align: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 60px 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.no-data svg {
  margin-bottom: 20px;
  opacity: 0.8;
}

.no-data h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.no-data p {
  font-size: 16px;
  opacity: 0.9;
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.hero-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.main-image {
  width: 100%;
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
}

.no-image {
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  color: #999;
}

.no-image svg {
  margin-bottom: 16px;
}

.no-image p {
  font-size: 16px;
  font-weight: 500;
}

.thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px;
}

.thumbnails::-webkit-scrollbar {
  height: 6px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.thumb {
  min-width: 120px;
  height: 80px;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.thumb:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.thumb.active {
  border-color: white;
  transform: scale(1.05);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-section {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.description-card,
.location-card {
  background: white;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.description-card h3,
.location-card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.description-card h3 svg,
.location-card h3 svg {
  color: #667eea;
}

.description {
  color: #555;
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
}

.coordinates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.coord-item {
  background: #f8f9ff;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.coord-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.coord-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.map-container {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-frame {
  width: 100%;
  height: 300px;
  border: none;
}

.map-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.map-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

@media (max-width: 968px) {
  .detail-content {
    grid-template-columns: 1fr;
  }

  .main-image {
    height: 400px;
  }

  .title {
    font-size: 28px;
  }
}

@media (max-width: 640px) {
  .detail-container {
    padding: 16px;
  }

  .main-image,
  .no-image {
    height: 300px;
  }

  .title {
    font-size: 24px;
  }

  .title-section,
  .description-card,
  .location-card {
    padding: 20px;
  }

  .coordinates {
    grid-template-columns: 1fr;
  }
}
</style>