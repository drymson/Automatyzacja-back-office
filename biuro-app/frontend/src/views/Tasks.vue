<template>
  <div class="inventory">
    <h1 class="title">Zarządzanie zadaniami</h1>

    <div class="filter-bar">
      <button @click="openModal()" class="button add ml-auto">+ Dodaj zadanie</button>
    </div>

    <div class="table-wrapper">
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
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.title }}</td>
            <td>{{ task.description }}</td>
            <td>
              <span :class="task.status === 'done' ? 'status-done' : 'status-pending'">
                {{ task.status === 'done' ? 'Wykonane' : 'Do wykonania' }}
              </span>
            </td>
            <td>
              <button class="action edit" @click="openModal(task)">Edytuj</button>
              <button class="action delete" @click="deleteTask(task.id)">Usuń</button>
            </td>
          </tr>
          <tr v-if="tasks.length === 0">
            <td colspan="4" class="no-data">Brak zadań.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal-title">
            {{ editingTask ? 'Edytuj zadanie' : 'Dodaj zadanie' }}
          </h2>
          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <label class="form-label">Tytuł</label>
              <input v-model="form.title" class="input" required />
            </div>
            <div class="form-row">
              <label class="form-label">Opis</label>
              <input v-model="form.description" class="input" />
            </div>
            <div class="form-row">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="input" required>
                <option value="pending">Do wykonania</option>
                <option value="done">Wykonane</option>
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
  name: 'Tasks',
  data() {
    return {
      tasks: [],
      modalOpen: false,
      editingTask: null,
      form: {
        title: '',
        description: '',
        status: 'pending',
      },
    };
  },
  methods: {
    fetchTasks() {
      axios
        .get('/api/tasks')
        .then((res) => (this.tasks = res.data))
        .catch(console.error);
    },
    openModal(task = null) {
      this.editingTask = task;
      this.form = task
        ? { ...task }
        : { title: '', description: '', status: 'pending' };
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.editingTask = null;
      this.form = { title: '', description: '', status: 'pending' };
    },
    async submitForm() {
      try {
        if (this.editingTask) {
          await axios.put(`/api/tasks/${this.editingTask.id}`, this.form);
        } else {
          await axios.post('/api/tasks', this.form);
        }
        this.closeModal();
        this.fetchTasks();
      } catch (err) {
        console.error(err);
        alert('Błąd przy zapisie zadania.');
      }
    },
    deleteTask(id) {
      axios
        .delete(`/api/tasks/${id}`)
        .then(() => this.fetchTasks())
        .catch((err) => {
          console.error(err);
          alert('Błąd przy usuwaniu zadania.');
        });
    },
  },
  mounted() {
    this.fetchTasks();
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
  width: 100%;
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
}
.add {
  background-color: #2ecc71;
  color: white;
}
.add:hover {
  background-color: #27ae60;
}
.save {
  background-color: #2563eb;
  color: white;
}
.save:hover {
  background-color: #2057d0;
}
.cancel {
  background-color: #e74c3c;
  color: white;
}
.cancel:hover {
  background-color: #c0392b;
}

/* RESPONSYWNY WRAPPER DLA TABELI */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 2rem;
}

/* tabela z minimalną szerokością, by zachować czytelność */
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  margin-bottom: 2rem;
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

.status-done {
  color: #27ae60;
  font-weight: 600;
}
.status-pending {
  color: #e67e22;
  font-weight: 600;
}

/* Responsywność */
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
    min-width: 600px; /* zapewnia minimalną szerokość na małych ekranach */
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
