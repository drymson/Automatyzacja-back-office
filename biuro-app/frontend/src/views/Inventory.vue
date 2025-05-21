<template>
  <div class="inventory">
    <h1 class="title">Rejestr zasobów biurowych</h1>

    <div class="filter-bar">
      <input
        v-model="filters.type"
        placeholder="Filtruj po kategorii"
        class="input"
        @keyup.enter="fetchInventory"
      />
      <button @click="fetchInventory" class="button apply">Zapisz</button>
      <button @click="resetFilters" class="button cancel">Resetuj</button>
      <button @click="openModal()" class="button add ml-auto">+ Dodaj nowy</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Nazwa</th>
          <th>Kategoria</th>
          <th>Ilość</th>
          <th>Lokalizacja</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.location || '-' }}</td>
          <td>
            <button class="action edit" @click="openModal(item)">Edytuj</button>
            <button class="action delete" @click="deleteItem(item.id)">Usuń</button>
          </td>
        </tr>
        <tr v-if="inventory.length === 0">
          <td colspan="5" class="no-data">Brak zasobów.</td>
        </tr>
      </tbody>
    </table>

    <transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal-title">
            {{ selectedItem ? 'Edytuj' : 'Dodaj' }} zasób
          </h2>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <label class="form-label">Nazwa</label>
              <input v-model="form.name" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Kategoria</label>
              <input v-model="form.type" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Ilość</label>
              <input
                v-model.number="form.quantity"
                type="number"
                min="0"
                class="input"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label">Lokalizacja</label>
              <input v-model="form.location" class="input" />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="button cancel">
                Anuluj
              </button>
              <button type="submit" class="button save">Zapisz</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Inventory',
  data() {
    return {
      inventory: [],
      filters: { type: '' },
      modalOpen: false,
      selectedItem: null,
      form: { name: '', type: '', quantity: 0, location: '' },
    };
  },
  methods: {
    fetchInventory() {
      axios
        .get('/api/office-resources', {
          params: this.filters.type ? { type: this.filters.type } : {}
        })
        .then(res => (this.inventory = res.data))
        .catch(err => {
          console.error(err);
          alert('Błąd przy pobieraniu zasobów.');
        });
    },
    resetFilters() {
      this.filters.type = '';
      this.fetchInventory();
    },
    openModal(item = null) {
      this.selectedItem = item;
      this.form = item
        ? { ...item }
        : { name: '', type: '', quantity: 0, location: '' };
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.selectedItem = null;
    },
    submitForm() {
      const url = this.selectedItem
        ? `/api/office-resources/${this.selectedItem.id}`
        : '/api/office-resources';
      const method = this.selectedItem ? 'put' : 'post';
      axios[method](url, this.form)
        .then(() => {
          this.closeModal();
          this.fetchInventory();
        })
        .catch(err => {
          console.error(err);
          alert('Błąd przy zapisywaniu zasobu.');
        });
    },
    deleteItem(id) {
      axios
        .delete(`/api/office-resources/${id}`)
        .then(() => this.fetchInventory())
        .catch(err => {
          console.error(err);
          alert('Błąd przy usuwaniu zasobu.');
        });
    },
  },
  mounted() {
    this.fetchInventory();
  },
};
</script>

<style scoped>
.inventory {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 0.5rem;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.input {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 200px;
}
.button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  background: #e0e0e0;
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.apply {
  background-color: #3498db;
  color: white;
}
.apply:hover {
  background-color: #2980b9;
}
.cancel {
  background-color: #e74c3c;
  color: white;
}
.cancel:hover {
  background-color: #c0392b;
}
.add {
  background-color: #2ecc71;
  color: white;
}
.add:hover {
  background-color: #27ae60;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}
.table th,
.table td {
  padding: 1rem;
  border: 1px solid #ddd;
  text-align: left;
}
.table th {
  background-color: #ecf0f1;
  color: #2c3e50;
}
.no-data {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 1.5rem;
}

.action {
  margin-right: 1rem;
  cursor: pointer;
  background: none;
  border: none;
  font-weight: bold;
}
.edit {
  color: #2563eb;
}
.edit:hover {
  text-decoration: underline;
}
.delete {
  color: #c0392b;
}
.delete:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}
.modal-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-align: center;
}
.modal-form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem 2rem;
  align-items: center;
}
.form-row {
  display: contents;
}
.form-label {
  justify-self: end;
  font-weight: 600;
}

.modal-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.save {
  background-color: #2563eb;
  color: white;
}
.save:hover {
  background-color: #2057d0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ml-auto {
  margin-left: auto;
}
</style>
