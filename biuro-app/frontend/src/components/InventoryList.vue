<template>
  <div>
    <h2 class="text-xl font-bold mb-2">Lista zasobów biurowych</h2>
    <ul>
      <li v-for="item in assets" :key="item.id" class="border p-2 my-1">
        {{ item.name }} ({{ item.type }}) – {{ item.quantity }} szt. – {{ item.location || 'brak lokalizacji' }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      assets: [],
    };
  },
  async mounted() {
    try {
      const res = await axios.get('http://localhost:5000/api/assets');
      this.assets = res.data;
    } catch (err) {
      console.error('Błąd podczas pobierania danych:', err);
    }
  },
};
</script>
