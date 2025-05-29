<template>
  <div class="account-page">
    <h1 class="title">Szczegóły konta</h1>

    <div v-if="loading" class="loading">Ładowanie danych konta...</div>
    <div v-else class="account-card">
      <div class="info-row">
        <span class="label">📧 Email:</span>
        <span class="value">{{ account.email }}</span>
      </div>
      <div class="info-row">
        <span class="label">👤 Nazwa użytkownika:</span>
        <div class="username-edit">
          <input
            v-model="usernameInput"
            :class="{ invalid: usernameError }"
            placeholder="Wpisz nazwę użytkownika"
            maxlength="30"
          />
          <button @click="updateUsername" :disabled="usernameLoading">Zapisz</button>
        </div>
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
      </div>

      <div v-if="usernameSuccess" class="success-message success-outside">
        Nazwa użytkownika została zaktualizowana.
      </div>
      <div class="info-row">
        <span class="label">📅 Data rejestracji:</span>
        <span class="value">{{ formattedDate }}</span>
      </div>
    </div>

    <div class="password-section">
      <h2>🔐 Zmień hasło</h2>
      <form @submit.prevent="changePassword" class="password-form">
        <div>
          <label>Stare hasło:</label>
          <input type="password" v-model="oldPassword" required />
        </div>
        <div>
          <label>Nowe hasło:</label>
          <input type="password" v-model="newPassword" required />
        </div>
        <div>
          <label>Powtórz nowe hasło:</label>
          <input type="password" v-model="repeatNewPassword" required />
        </div>
        <button type="submit" class="change-btn">Zmień hasło</button>
      </form>
    </div>

    <div class="delete-section">
      <button @click="deleteAccount" class="delete-btn">🗑️ Usuń konto</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Account',
  data() {
    return {
      account: {
        email: '',
        registeredAt: '',
        username: '',
      },
      usernameInput: '',
      usernameError: '',
      usernameSuccess: false,
      usernameLoading: false,

      loading: true,
      oldPassword: '',
      newPassword: '',
      repeatNewPassword: '',
    };
  },
  computed: {
    formattedDate() {
      const date = new Date(this.account.registeredAt);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  methods: {
    async updateUsername() {
      this.usernameError = '';
      this.usernameSuccess = false;

      const newUsername = this.usernameInput.trim();

      if (!newUsername) {
        this.usernameError = 'Nazwa użytkownika nie może być pusta.';
        return;
      }
      if (newUsername.length < 3) {
        this.usernameError = 'Nazwa użytkownika musi mieć co najmniej 3 znaki.';
        return;
      }

      this.usernameLoading = true;
      const token = sessionStorage.getItem('token');

      try {
        await axios.put('http://localhost:4000/api/account/username', {
          username: newUsername,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.account.username = newUsername;
        this.usernameSuccess = true;
      } catch (err) {
        if (err.response?.data?.error) {
          this.usernameError = err.response.data.error;
        } else {
          this.usernameError = 'Wystąpił błąd podczas aktualizacji nazwy użytkownika.';
        }
      } finally {
        this.usernameLoading = false;
      }
    },

    async deleteAccount() {
      const confirmed = confirm('Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć.');
      if (!confirmed) return;

      const token = sessionStorage.getItem('token');

      try {
        await axios.delete('http://localhost:4000/api/account', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Konto zostało usunięte.');
        sessionStorage.removeItem('token');
        this.$router.push('/login');
      } catch (err) {
        console.error('❌ Błąd usuwania konta:', err);
        alert('Wystąpił błąd przy usuwaniu konta.');
      }
    },

    async changePassword() {
      if (this.newPassword !== this.repeatNewPassword) {
        alert('Nowe hasło i jego potwierdzenie nie są takie same.');
        return;
      }

      const token = sessionStorage.getItem('token');

      try {
        await axios.put('http://localhost:4000/api/account/password', {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Hasło zostało zmienione. Zaloguj się ponownie.');

        sessionStorage.removeItem('token');

        this.$router.push('/login');

      } catch (err) {
        console.error('❌ Błąd zmiany hasła:', err);
        alert(err.response?.data?.message || 'Wystąpił błąd.');
      }
    }
  },
  mounted() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.account = { email: 'Brak tokena, nieautoryzowany', registeredAt: new Date().toISOString(), username: '' };
      this.loading = false;
      return;
    }

    axios.get('http://localhost:4000/api/account', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        this.account = res.data;
        this.usernameInput = this.account.username || '';
      })
      .catch(() => {
        this.account = { email: 'Brak danych lub błąd autoryzacji', registeredAt: new Date().toISOString(), username: '' };
      })
      .finally(() => {
        this.loading = false;
      });
  },
};
</script>

<style scoped>
.account-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
}

.account-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.info-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1.05rem;
  min-height: 50px;
}

.label {
  font-weight: bold;
  color: #444;
  flex: 0 0 170px;
  margin-right: 1rem;
}

.value, .username-edit {
  color: #555;
  flex:1;
}

.username-edit {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  max-width: 320px;
  height: 38px;
  box-sizing: border-box;
}

.username-edit input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  height: 100%;
  box-sizing: border-box;
}

.username-edit input.invalid {
  border-color: #e74c3c;
  background-color: #fbeaea;
}

.username-edit button {
  padding: 0 1rem;
  height: 100%;
  background-color: #2980b9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.username-edit button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.username-edit button:hover:not(:disabled) {
  background-color: #1f6391;
}

.error-message,
.success-message {
  font-size: 0.9rem;
  margin-top: 0.25rem;
  min-height: 1.2em;
}

.success-outside {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #27ae60;
  font-weight: 600;
  text-align: center;
}

.error-message {
  color: #e74c3c;
}

.success-message {
  color: #27ae60;
}

.loading {
  text-align: center;
  color: #777;
  font-size: 1rem;
}

.delete-section {
  text-align: center;
  margin-top: 2rem;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.password-section {
  margin-top: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.password-form label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
  color: #444;
}

.password-form input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.change-btn {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}

.change-btn:hover {
  background-color: #1f6391;
}

.dark-mode .account-card {
  background-color: #1f1f1f;
  color: white;
  border: 1px solid #333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.85);
}

.dark-mode .label {
  color: #ccc;
}

.dark-mode .value {
  color: #eee;
}

.dark-mode .loading {
  color: #bbb;
}

.dark-mode .title {
  background: linear-gradient(135deg, #2a2a2a, #1e1e1e);
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
}

.dark-mode .password-section {
  background-color: #2b2b2b;
}

.dark-mode .password-form label {
  color: #ccc;
}

.dark-mode .password-form input {
  background-color: #444;
  color: #eee;
  border: 1px solid #666;
}

.dark-mode .change-btn {
  background-color: #1f6391;
}
</style>
