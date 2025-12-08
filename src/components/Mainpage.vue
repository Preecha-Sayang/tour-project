<script setup  lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

interface Trip {
  id: number;
  title: string;
  description: string;
  tags: string[];
  photos: string[];
}

const trips = ref<Trip[]>([]);
const allTrips = ref<Trip[]>([]);
const loading = ref<boolean>(true);
const searchQuery = ref<string>('');
const itemsPerPage = 5;
const displayedItems = ref<number>(itemsPerPage);

// API base
const API_BASE = "https://server-springboot-1.onrender.com/api/trips";

const router = useRouter();

const fetchAll = async () => {
  loading.value = true;
  try {
    const response = await axios.get<Trip[]>(API_BASE);
    allTrips.value = response.data;
    trips.value = response.data.slice(0, displayedItems.value);
  } catch (error) {
    console.error("Error fetching trips:", error);
    allTrips.value = [];
    trips.value = [];
  } finally {
    loading.value = false;
  }
};

const searchServer = async (keyword: string) => {
  loading.value = true;
  try {
    const response = await axios.get<Trip[]>(`${API_BASE}/search`, {
      params: { keyword },
    });
    allTrips.value = response.data;
    displayedItems.value = itemsPerPage;
    trips.value = response.data.slice(0, displayedItems.value);
  } catch (error) {
    console.error("Error searching trips:", error);
    allTrips.value = [];
    trips.value = [];
  } finally {
    loading.value = false;
  }
};

const performSearch = async () => {
  const q = searchQuery.value?.trim() ?? "";
  if (q === "") {
    await fetchAll();
  } else {
    await searchServer(q);
  }
};

const loadMore = () => {
  displayedItems.value += itemsPerPage;
  trips.value = allTrips.value.slice(0, displayedItems.value);
};

const hasMore = () => {
  return displayedItems.value < allTrips.value.length;
};

onMounted(async () => {
  await fetchAll();
});

const openDetail = (trip: Trip) => {
  // ไปหน้า detail โดยส่ง id เป็น param
  router.push(`/detail/${trip.id}`);
};

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const copyLink = (e: Event, tripId: number) => {
  e.stopPropagation();
  const link = `${window.location.origin}/detail/${tripId}`;
  navigator.clipboard.writeText(link);
};
</script>

<template>


  <section class="hero">
    <div class="container">
      <h1>ค้นพบสถานที่ท่องเที่ยวสุดพิเศษ</h1>
      <p>เที่ยวทั่วไทย พบประสบการณ์ที่น่าจดจำ</p>
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="ค้นหาสถานที่ท่องเที่ยว..." 
          v-model="searchQuery"
        />
        <!-- เปลี่ยนให้ปุ่มเป็น type="button" และเรียก performSearch เมื่อคลิก -->
        <button type="button" @click="performSearch">ค้นหา</button>
      </div>
    </div>
  </section>

  <div class="container">
    <h2 class="section-title">สถานที่ยอดนิยม</h2>

    <div v-if="loading" class="loading">
      กำลังโหลดข้อมูล...
    </div>

    <div v-else-if="trips.length === 0" class="no-data">
      ไม่พบข้อมูลที่ค้นหา
    </div>

    <div v-else>
      <div class="destinations">
        <div
          class="destination-card"
          v-for="trip in trips"
          :key="trip.id"
          @click="openDetail(trip)"
        >
          <div class="card-image-section">
            <div
              class="card-image-main"
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
          </div>

          <div class="card-content">
            <div class="card-title">{{ trip.title }}</div>
            <div class="card-description">{{ truncateText(trip.description, 150) }}</div>
            
            <div class="card-tags" v-if="trip.tags && trip.tags.length > 0">
              🏷️ 
              <span v-for="(tag, index) in trip.tags" :key="index">
                <span class="tag-link">{{ tag }}</span>
                <span v-if="index < trip.tags.length - 1"> • </span>
              </span>
            </div>
            
            <div class="card-thumbnails" v-if="trip.photos && trip.photos.length > 1">
              <div 
                class="thumbnail"
                v-for="(image, index) in trip.photos.slice(1, 4)"
                :key="index"
                :style="{
                  backgroundImage: `url('${image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }"
              ></div>
            </div>
          </div>

          <div class="card-link">
            <a href="#" class="link-icon" @click.prevent="copyLink($event, trip.id)" title="คัดลอก link">🔗</a>
          </div>
        </div>
      </div>

      <div v-if="hasMore()" class="load-more-section">
        <button @click="loadMore" class="load-more-btn">โหลดเพิ่มเติม</button>
      </div>
    </div>
  </div>



</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}



nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}





.hero {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.95;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  background: white;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.search-bar input {
  flex: 1;
  border: none;
  padding: 18px 30px;
  font-size: 16px;
  outline: none;
}

.search-bar button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.search-bar button:hover {
  transform: scale(1.05);
}

.loading,
.no-data {
  text-align: center;
  color: white;
  font-size: 20px;
  padding: 40px;
}

.destinations {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 40px;
}

.destination-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  min-height: 220px;
  position: relative;
}

.destination-card:hover {
  transform: translateX(5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.card-image-section {
  width: 300px;
  min-width: 300px;
  padding: 15px;
}

.card-image-main {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 190px;
}

.no-image-text {
  color: white;
  font-size: 18px;
}

.card-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
}

.card-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.card-tags {
  color: #999;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.8;
}

.tag-link {
  color: #4A90E2;
  text-decoration: underline;
  margin: 0 2px;
  cursor: pointer;
}

.tag-link:hover {
  color: #667eea;
}

.card-thumbnails {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.thumbnail {
  width: 90px;
  height: 65px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  border: 2px solid #f0f0f0;
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.card-link {
  display: flex;
  align-items: flex-end;
  padding: 25px;
}

.link-icon {
  font-size: 28px;
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
  background: #f0f0f0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-icon:hover {
  transform: rotate(45deg);
  background: #667eea;
}

.section-title {
  text-align: center;
  color: white;
  font-size: 36px;
  margin: 0px 0 30px;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.load-more-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .nav-links {
    gap: 15px;
  }

  .destination-card {
    flex-direction: column;
  }

  .card-image-section {
    width: 100%;
  }

  .card-image-main {
    height: 220px;
  }

  .card-link {
    display: none;
  }
}
</style>