<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const trips = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('https://server-springboot-1.onrender.com/api/trips');
    trips.value = response.data;
    console.log(trips.value);
  } catch (error) {
    console.error('Error fetching trips:', error);
  }
});
</script>


<template>
  <div>
    <h1>All Trips</h1>
    <ul>
      <li v-for="trip in trips" :key="trip.id">
        {{ trip.title }} - {{ trip.province }}

      </li>
    </ul>
  </div>
</template>


<style >

</style>