<template>
  <div class="inventory">
    <h1 class="title">Rejestr zapasów spożywczych i chemicznych</h1>

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
        v-model="filters.category"
        placeholder="Filtruj po kategorii"
        class="input"
        @keyup.enter="fetchSupplies"
      />
      <button @click="fetchSupplies" class="button apply">Zapisz</button>
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
          <tr v-for="supply in supplies" :key="supply.id">
            <td>{{ supply.name }}</td>
            <td>{{ supply.category }}</td>
            <td>{{ supply.quantity }}</td>
            <td>{{ supply.location || '-' }}</td>
            <td>
              <button class="action edit" @click="openModal(supply)">Edytuj</button>
              <button class="action delete" @click="deleteSupply(supply.id)">Usuń</button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td colspan="5" class="no-data">Brak zapasów.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal-title">
            {{ selectedSupply ? 'Edytuj' : 'Dodaj' }} zapas
          </h2>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <label class="form-label">Nazwa</label>
              <input v-model="form.name" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Kategoria</label>
              <input v-model="form.category" class="input" required />
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
  name: 'Supplies',
  data() {
    return {
      supplies: [],
      filters: { category: '' },
      modalOpen: false,
      selectedSupply: null,
      form: { name: '', quantity: 0, category: '', location: '' },
      lowStock: [],
    };
  },
  methods: {
    async fetchSupplies() {
      try {
        const res = await axios.get('/api/supplies', {
          params: this.filters.category ? { category: this.filters.category } : {}
        });
        this.supplies = res.data;
      } catch (error) {
        console.error(error);
        alert('Błąd podczas pobierania zapasów.');
      }
    },
    resetFilters() {
      this.filters.category = '';
      this.fetchSupplies();
    },
    openModal(supply = null) {
      this.selectedSupply = supply;
      this.form = supply
        ? { ...supply }
        : { name: '', quantity: 0, category: '', location: '' };
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.selectedSupply = null;
    },
    async submitForm() {
      try {
        const url = this.selectedSupply
          ? `/api/supplies/${this.selectedSupply.id}`
          : '/api/supplies';
        const method = this.selectedSupply ? 'put' : 'post';
        await axios[method](url, this.form);
        this.closeModal();
        this.fetchSupplies();
        this.fetchLowStockAlerts();
      } catch (error) {
        console.error(error);
        alert('Błąd przy zapisywaniu zapasu.');
      }
    },
    deleteSupply(id) {
      axios
        .delete(`/api/supplies/${id}`)
        .then(() => {
          this.fetchSupplies();
          this.fetchLowStockAlerts();
        })
        .catch(err => {
          console.error(err);
          alert('Błąd przy usuwaniu zapasu.');
        });
    },
    async fetchLowStockAlerts() {
      try {
        const res = await axios.get('/api/supplies/alerts');
        this.lowStock = res.data;
      } catch {
        this.lowStock = [];
      }
    },

    // --- DODANE METODY EXPORTU ---

    exportToPDF() {
      if (!window.pdfMake) {
        alert('pdfMake nie jest załadowany!');
        return;
      }

      const docDefinition = {
        content: [
          { text: 'Rejestr zapasów', style: 'header' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', 'auto', '*'],
              body: [
                ['Nazwa', 'Kategoria', 'Ilość', 'Lokalizacja'],
                ...this.supplies.map(s => [
                  s.name,
                  s.category,
                  s.quantity.toString(),
                  s.location || '-'
                ]),
              ]
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            marginBottom: 15,
          }
        },
        defaultStyle: {
          fontSize: 12,
        }
      };

      window.pdfMake.createPdf(docDefinition).download('rejestr_zapasów.pdf');
    },

    exportToCSV() {
      if (!this.supplies.length) {
        alert('Brak danych do eksportu.');
        return;
      }

      const headers = ['Nazwa', 'Kategoria', 'Ilość', 'Lokalizacja'];
      const rows = this.supplies.map(s => [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.category.replace(/"/g, '""')}"`,
        s.quantity,
        `"${(s.location || '-').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'rejestr_zapasów.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  mounted() {
    this.fetchSupplies();
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
  color:  #2c3e50;
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

.inventory {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
}

.dark-mode .inventory {
  background: #1c1c1c;
  color: #ffffff;
}

.dark-mode .title {
  border-bottom-color: #3b82f6;
}

.dark-mode .input {
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #ffffff;
}

.dark-mode .button,
.dark-mode .apply,
.dark-mode .cancel,
.dark-mode .add,
.dark-mode .save {
  background-color: #2a2a2a;
  color: #ffffff;
  border: 1px solid #444;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.dark-mode .button:hover,
.dark-mode .apply:hover,
.dark-mode .cancel:hover,
.dark-mode .add:hover,
.dark-mode .save:hover {
  background-color: #1d1d1d;
  border-color: #666;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.9);
}

.dark-mode .button:focus,
.dark-mode .apply:focus,
.dark-mode .cancel:focus,
.dark-mode .add:focus,
.dark-mode .save:focus {
  outline: 2px solid #999999;
  outline-offset: 2px;
  background-color: #242424;
  box-shadow: 0 0 8px #999999;
}

.dark-mode .table th {
  background-color: #2b2b2b;
  color: #ffffff;
  border-color: #444;
}

.dark-mode .table td {
  background-color: #1f1f1f;
  border-color: #333;
  color: #ffffff;
}

.dark-mode .table tr:hover {
  background: #0e0e0e;
}

.dark-mode .alerts {
  background-color: #3a2f00;
  border: 1px solid #5c4200;
  color: #ffd700;
}

.dark-mode .no-data {
  color: #ffffff;
}

.dark-mode .action.edit,
.dark-mode .action.delete {
  background: none;
  border: none;
  box-shadow: none;
  padding: 4px 10px;
  font-weight: 500;
  border-radius: 4px;
}

.dark-mode .action.edit {
  color: #60a5fa;
}

.dark-mode .action.delete {
  color: #f87171;
}

.dark-mode .action.edit:hover,
.dark-mode .action.delete:hover {
  text-decoration: underline;
  background: none;
}

.dark-mode .edit-modal,
.dark-mode .modal,
.dark-mode .modal-content {
  background-color: #121212;
  color: #ffffff;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.dark-mode .form-label {
  color: #ffffff;
}

.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
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
