<template>
  <div class="inventory">
    <h1 class="title">Rejestr zgłoszeń</h1>

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

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Tytuł</th>
            <th>Opis</th>
            <th>Status</th>
            <th>Data utworzenia</th>
            <th>Dodane przez</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.subject }}</td>
            <td>{{ ticket.description }}</td>
            <td :class="getStatusClass(ticket.status)">{{ formatStatus(ticket.status) }}</td>
            <td>{{ formatDate(ticket.created_at) }}</td>
            <td>{{ ticket.username || 'Nieznany' }}</td>
            <td>
              <button class="action edit" @click="openModal(task)">Edytuj</button>
              <button class="action delete" @click="deleteTask(task.id)">Usuń</button>
            </td>
          </tr>
          <tr v-if="tickets.length === 0">
            <td colspan="6" class="no-data">Brak zgłoszeń.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal-title">
            {{ selectedTicket ? 'Edytuj' : 'Dodaj' }} zgłoszenie
          </h2>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <label class="form-label">Tytuł</label>
              <input v-model="form.subject" class="input" required />
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
              <div class="form-row">
                <label class="form-label">Data</label>
                <input
                  v-model="form.date"
                  type="datetime-local"
                  class="input"
                  required
                />
              </div>
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
      form: { subject: '', description: '', status: 'open', date: '' },
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
    formatForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const pad = (num) => num.toString().padStart(2, '0');

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    resetFilters() {
      this.filters.status = '';
      this.fetchTickets();
    },
    openModal(ticket = null) {
      this.selectedTicket = ticket;
      this.form = ticket
        ? {
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            date: ticket.created_at ? this.formatForInput(ticket.created_at) : ''
          }
        : { subject: '', description: '', status: 'open', date: '' };
      this.modalOpen = true;
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
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
          subject: this.form.subject,
          description: this.form.description,
          status: this.form.status,
          priority: 'normal',
          user_id: Number(localStorage.getItem('user_id')) || Number(sessionStorage.getItem('user_id')),
          ...(this.form.date ? { created_at: new Date(this.form.date).toISOString() } : {}),
        };


        console.log('Payload:', payload);

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
    getStatusClass(status) {
      const validStatuses = ['open', 'in_progress', 'closed'];
      return validStatuses.includes(status) ? `status-${status}` : '';
    }
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
  box-sizing: border-box;
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
  white-space: nowrap;
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
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  min-width: 600px;
}
.table th,
.table td {
  padding: 1rem;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
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
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
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
.save:hover {
  background-color: #2057d0;
}
.status-open {
  color: #e67e22;
  font-weight: 600;
}
.status-in_progress {
  color: #2563eb;
  font-weight: 600;
}
.status-closed {
  color: #27ae60;
  font-weight: 600;
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

.dark-mode .inventory {
  background: #1c1c1c;
  color: #ffffff;
}

.dark-mode .title {
  border-bottom-color: #3b82f6;
}

.dark-mode .input,
.dark-mode input,
.dark-mode select,
.dark-mode textarea {
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #ffffff;
}

.dark-mode label,
.dark-mode .form-label {
  color: #ffffff;
}

.dark-mode .button,
.dark-mode button,
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
.dark-mode button:hover,
.dark-mode .apply:hover,
.dark-mode .cancel:hover,
.dark-mode .add:hover,
.dark-mode .save:hover {
  background-color: #1d1d1d;
  border-color: #666;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.9);
}

.dark-mode .button:focus,
.dark-mode button:focus,
.dark-mode .apply:focus,
.dark-mode .cancel:focus,
.dark-mode .add:focus,
.dark-mode .save:focus {
  outline: 2px solid #999999;
  outline-offset: 2px;
  background-color: #242424;
  box-shadow: 0 0 8px #999999;
}

.dark-mode .table td.status-open {
  color: #e67e22 !important;
  font-weight: 600;
}
.dark-mode .table td.status-in_progress {
  color: #2563eb !important;
  font-weight: 600;
}
.dark-mode .table td.status-closed {
  color: #27ae60 !important;
  font-weight: 600;
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

.dark-mode .modal,
.dark-mode .modal-content {
  background-color: #121212;
  color: #ffffff;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.dark-mode .modal-title {
  color: #ffffff;
}

.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

@media (max-width: 600px) {
  .filter-bar {
    flex-direction: column;
  }
  .input {
    width: 100% !important;
  }
  .button {
    width: 100%;
    white-space: normal;
  }
  .ml-auto {
    margin-left: 0 !important;
  }
  .modal-form {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
  .form-label {
    justify-self: start !important;
  }
  .modal-actions {
    justify-content: center !important;
  }
}
</style>
