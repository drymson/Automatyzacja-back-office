<template>
  <div class="inventory">
    <h1 class="title">Rejestr zgłoszeń</h1>

    <!-- FILTRY -->
    <div class="filter-bar">
      <input
        v-model="filters.status"
        placeholder="Filtruj po statusie"
        class="input"
        @keyup.enter="fetchTickets"
      />
      <button @click="fetchTickets" class="button apply">Zapisz</button>
      <button @click="resetFilters" class="button cancel">Resetuj</button>
      <button @click="openModal()" class="button add ml-auto">+ Dodaj zgłoszenie</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Tytuł</th>
          <th>Opis</th>
          <th>Status</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>{{ ticket.subject }}</td>
          <td>{{ ticket.description }}</td>
          <td>{{ formatStatus(ticket.status) }}</td>
          <td>
            <button class="action edit" @click="openModal(ticket)">Edytuj</button>
            <button class="action delete" @click="deleteTicket(ticket.id)">Usuń</button>
          </td>
        </tr>
        <tr v-if="tickets.length === 0">
          <td colspan="4" class="no-data">Brak zgłoszeń.</td>
        </tr>
      </tbody>
    </table>

    <transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal-title">
            {{ selectedTicket ? 'Edytuj' : 'Dodaj' }} zgłoszenie
          </h2>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <label class="form-label">Tytuł</label>
              <input v-model="form.title" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Opis</label>
              <input v-model="form.description" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="input" required>
                <option value="open">Otwarte</option>
                <option value="in_progress">W trakcie</option>
                <option value="closed">Zamknięte</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="button cancel">Anuluj</button>
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
  name: 'Tickets',
  data() {
    return {
      tickets: [],
      filters: { status: '' },
      modalOpen: false,
      selectedTicket: null,
      form: { title: '', description: '', status: 'open' },
    };
  },
  methods: {
    async fetchTickets() {
      try {
        const res = await axios.get('/api/tickets', {
          params: this.filters.status ? { status: this.filters.status } : {},
        });
        this.tickets = res.data;
      } catch (error) {
        console.error(error);
        alert('Błąd podczas pobierania zgłoszeń.');
      }
    },
    resetFilters() {
      this.filters.status = '';
      this.fetchTickets();
    },
    openModal(ticket = null) {
      this.selectedTicket = ticket;
      this.form = ticket
        ? {
            title: ticket.subject,
            description: ticket.description,
            status: ticket.status,
          }
        : { title: '', description: '', status: 'open' };
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.selectedTicket = null;
    },
  async submitForm() {
    try {
      const url = this.selectedTicket
        ? `/api/tickets/${this.selectedTicket.id}`
        : '/api/tickets';
      const method = this.selectedTicket ? 'put' : 'post';

      const payload = {
        subject: this.form.title,
        description: this.form.description,
        status: this.form.status,
        priority: 'normal'
      };

      await axios[method](url, payload);
      this.closeModal();
      this.fetchTickets();
    } catch (error) {
      console.error(error);
      alert('Błąd przy zapisywaniu zgłoszenia.');
    }   
  },
    deleteTicket(id) {
      axios
        .delete(`/api/tickets/${id}`)
        .then(() => this.fetchTickets())
        .catch((err) => {
          console.error(err);
          alert('Błąd przy usuwaniu zgłoszenia.');
        });
    },
    formatStatus(status) {
      switch (status) {
        case 'open':
          return 'Otwarte';
        case 'in_progress':
          return 'W trakcie';
        case 'closed':
          return 'Zamknięte';
        default:
          return status;
      }
    },
  },
  mounted() {
    this.fetchTickets();
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
  color: #dc2626;
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
