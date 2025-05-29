<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const emailExists = ref(false);
const router = useRouter();

const register = async () => {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = 'Hasła nie są zgodne';
    return;
  }
  if (emailExists.value) {
    error.value = 'Email już istnieje';
    return;
  }
  if (!username.value) {
    error.value = 'Podaj nazwę użytkownika';
    return;
  }
  try {
    await axios.post('http://localhost:4000/api/auth/register', {
      email: email.value,
      username: username.value,
      password: password.value,
    });
    alert('Zarejestrowano! Możesz się teraz zalogować.');
    router.push('/login');
  } catch (e) {
    error.value = e.response?.data?.error || 'Błąd rejestracji';
  }
};

const checkEmail = async () => {
  if (!email.value) return;
  try {
    const res = await axios.get(`http://localhost:4000/api/auth/check-email?email=${encodeURIComponent(email.value)}`);
    emailExists.value = res.data.exists;
  } catch (e) {
    console.error('Błąd przy sprawdzaniu emaila:', e);
  }
};
</script>

<template>
  <div class="auth-container">
    <h1 class="title">Automatyzacja back-office</h1>
    <div class="auth-card">
      <h2 class="form-header">Rejestracja</h2>

      <input v-model="email" @blur="checkEmail" type="email" placeholder="Email" class="auth-input" />
      <p v-if="emailExists" class="auth-error">Ten email już istnieje</p>

      <input v-model="username" type="text" placeholder="Nazwa użytkownika" class="auth-input" />

      <input v-model="password" type="password" placeholder="Hasło" class="auth-input" />
      <input v-model="confirmPassword" type="password" placeholder="Potwierdź hasło" class="auth-input" />

      <button @click="register" class="auth-button">Zarejestruj się</button>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <p class="register-link">
        Masz już konto?
        <router-link to="/login">Zaloguj się</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 1.5rem;
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
  word-break: break-word;
}

.auth-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-header {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: bold;
  color: #333;
}

.auth-input {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.auth-input:focus {
  outline: none;
  border-color: #3498db;
}

.auth-button {
  background-color: #3498db;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.auth-button:hover {
  background-color: #2980b9;
}

.auth-error {
  color: red;
  margin-top: 0.5rem;
  font-weight: 500;
  text-align: center;
  font-size: 0.95rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
}

.register-link a {
  color: #3498db;
  font-weight: bold;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.auth-input {
  max-width: 300px;
  margin: 0 auto 1rem;
  display: block;
}
</style>
