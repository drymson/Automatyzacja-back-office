<template>
  <div class="dashboard">
    <h1 class="title" @click="activePanel = null">Panel biurowy</h1>
    <p class="welcome">
      Witaj w panelu administracyjnym! Tutaj zarządzasz zasobami, zapasami, zadaniami i zgłoszeniami – wszystko w jednym miejscu.
    </p>

    <div class="stats-cards">
      <div class="card">
        <div class="card-icon">📂</div>
        <div class="card-number">{{ inventoryCount }}</div>
        <div class="card-label">Zasoby biurowe</div>
      </div>
      <div class="card">
        <div class="card-icon">📦</div>
        <div class="card-number">{{ suppliesCount }}</div>
        <div class="card-label">Zapasy spożywcze i chemiczne</div>
      </div>
      <div class="card">
        <div class="card-icon">✅</div>
        <div class="card-number">{{ tasksDone }} / {{ tasksTotal }}</div>
        <div class="card-label">Zadania zakończone</div>
      </div>
      <div class="card">
        <div class="card-icon">🎫</div>
        <div class="card-number">{{ ticketsOpen }}</div>
        <div class="card-label">Otwarte zgłoszenia</div>
      </div>
    </div>

    <div class="button-group">
      <button @click="togglePanel('inventory')" class="nav-button">📂 Zasoby biurowe</button>
      <button @click="togglePanel('supplies')" class="nav-button">📦 Zapasy spożywcze i chemiczne</button>
      <button @click="togglePanel('tasks')" class="nav-button">✅ Zadania</button>
      <button @click="togglePanel('tickets')" class="nav-button">🎫 Zgłoszenia</button>
    </div>

    <transition name="fade">
      <div class="section" v-show="activePanel">
        <component :is="getComponentForPanel()" />
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Inventory from './Inventory.vue';
import Supplies from './Supplies.vue';
import Tasks from './Tasks.vue';
import Tickets from './Tickets.vue';

export default {
  name: 'Dashboard',
  components: {
    Inventory,
    Supplies,
    Tasks,
    Tickets,
  },
  data() {
    return {
      inventoryCount: 0,
      suppliesCount: 0,
      tasksTotal: 0,
      tasksDone: 0,
      ticketsOpen: 0,
      activePanel: null,
    };
  },
  methods: {
    togglePanel(panel) {
      this.activePanel = this.activePanel === panel ? null : panel;
    },
    getComponentForPanel() {
      switch (this.activePanel) {
        case 'inventory': return 'Inventory';
        case 'supplies': return 'Supplies';
        case 'tasks': return 'Tasks';
        case 'tickets': return 'Tickets';
        default: return null;
      }
    }
  },
  mounted() {
    axios.get('/api/office-resources')
      .then(res => { this.inventoryCount = res.data.length; })
      .catch(() => {});

    axios.get('/api/supplies')
      .then(res => { this.suppliesCount = res.data.length; })
      .catch(() => {});

    axios.get('/api/tasks')
      .then(res => {
        this.tasksTotal = res.data.length;
        this.tasksDone = res.data.filter(t => t.status === 'done').length;
      })
      .catch(() => {});

    axios.get('/api/tickets', { params: { status: 'open' } })
      .then(res => { this.ticketsOpen = res.data.length; })
      .catch(() => {});
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #ffffff;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  cursor: pointer;
  word-break: break-word;
}

.welcome {
  text-align: center;
  color: #555;
  font-size: 1.05rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.card-number {
  font-size: 1.6rem;
  font-weight: bold;
}

.card-label {
  color: #666;
  font-size: 0.95rem;
}

.button-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-button {
  background-color: #3498db;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  flex: 1 1 200px;
  text-align: center;
}

.nav-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.section {
  border-top: 1px solid #ddd;
  padding-top: 2rem;
  overflow: hidden;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
    padding: 0.75rem 1rem;
  }

  .card-icon {
    font-size: 1.8rem;
  }

  .card-number {
    font-size: 1.4rem;
  }

  .card-label {
    font-size: 0.85rem;
  }

  .nav-button {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .dashboard {
    padding: 1.5rem 0.5rem;
  }

  .nav-button {
    flex: 1 1 auto;
  }
}
</style>

