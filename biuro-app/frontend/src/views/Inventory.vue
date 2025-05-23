<template>
  <div class="inventory">
    <h1 class="title">Rejestr zasobów biurowych</h1>

    <div v-if="lowStock.length" class="alerts">
      <h3>Uwaga! Niski stan zapasów:</h3>
      <ul>
        <li v-for="item in lowStock" :key="item.id">
          {{ item.name }} (ilość: {{ item.quantity }})
        </li>
      </ul>
    </div>

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

    <div class="filter-bar" style="margin-bottom: 1rem;">
      <button @click="exportToPDF" class="button apply with-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="18" height="18" style="margin-right: 6px;">
          <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM13 3.5V8h4.5L13 3.5zM7.5 14h1v-4h-1v4zm3 0h1v-4h-1v4zm3 0h1v-4h-1v4z"/>
        </svg>
        Eksportuj do PDF
      </button>
      <button @click="exportToCSV" class="button apply with-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="18" height="18" style="margin-right: 6px;">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-4h2v4z"/>
        </svg>
        Eksportuj do CSV
      </button>
    </div>


    <div class="table-wrapper">
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
    </div>

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
      lowStock: [],
    };
  },
  methods: {
    fetchInventory() {
      axios
        .get('/api/office-resources', {
          params: this.filters.type ? { type: this.filters.type } : {},
        })
        .then((res) => (this.inventory = res.data))
        .catch((err) => {
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
          this.fetchLowStockAlerts();
        })
        .catch((err) => {
          console.error(err);
          alert('Błąd przy zapisywaniu zasobu.');
        });
    },
    deleteItem(id) {
      axios
        .delete(`/api/office-resources/${id}`)
        .then(() => {
          this.fetchInventory();
          this.fetchLowStockAlerts();
        })
        .catch((err) => {
          console.error(err);
          alert('Błąd przy usuwaniu zasobu.');
        });
    },
    fetchLowStockAlerts() {
      axios
        .get('/api/office-resources/alerts')
        .then((res) => {
          this.lowStock = res.data;
        })
        .catch(() => {
          this.lowStock = [];
        });
    },

    exportToPDF() {
      const docDefinition = {
        content: [
          { text: 'Rejestr zasobów biurowych', style: 'header' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                ['Nazwa', 'Kategoria', 'Ilość', 'Lokalizacja'],
                ...this.inventory.map(item => [
                  item.name,
                  item.type,
                  item.quantity,
                  item.location || '-',
                ]),
              ],
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            marginBottom: 15,
          },
        },
        defaultStyle: {
          font: 'Roboto',
        },
      };

      pdfMake.createPdf(docDefinition).download('rejestr_zasobów.pdf');
    },

    exportToCSV() {
      const headers = ['Nazwa', 'Kategoria', 'Ilość', 'Lokalizacja'];
      const rows = this.inventory.map(item => [
        item.name,
        item.type,
        item.quantity,
        item.location || '-',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers, ...rows]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'rejestr_zasobów.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  mounted() {
    this.fetchInventory();
    this.fetchLowStockAlerts();
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

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 2rem;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.table th,
.table td {
  padding: 1rem;
  border: 1px solid #ddd;
  text-align: left;
  word-wrap: break-word;
  white-space: normal;
}
.table th {
  background-color: #ecf0f1;
  color: #2c3e50;
}
.table tr:hover {
  background: #f0fdf4;
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
  font-size: 0.9rem;
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
  margin-top: 1rem;
}
.save {
  background-color: #2563eb;
  color: white;
}
.cancel {
  background-color: #e74c3c;
  color: white;
}
.save:hover {
  background-color: #2057d0;
}
.cancel:hover {
  background-color: #c0392b;
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
.alerts {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  color: #856404;
  font-weight: 600;
}
.alerts h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}
.alerts ul {
  margin: 0;
  padding-left: 1.2rem;
}
@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .input {
    width: 100%;
  }
  .table {
    min-width: 600px;
  }
  .modal-form {
    grid-template-columns: 1fr;
  }
  .form-label {
    justify-self: start;
  }
  .modal {
    padding: 1rem;
  }
  .modal-title {
    font-size: 1.1rem;
  }
}
</style>
