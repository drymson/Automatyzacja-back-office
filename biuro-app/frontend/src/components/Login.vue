<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const email = ref('');
const password = ref('');
const remember = ref(false);
const error = ref('');
const router = useRouter();

const login = async () => {
  error.value = '';
  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: email.value,
      password: password.value,
    });

    console.log('Login success:', res.data);

    const token = res.data.token;
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);
    const userId = res.data.user_id;

    sessionStorage.clear();
    localStorage.clear();

    if (remember.value) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', res.data.role);
      sessionStorage.setItem('email', res.data.email);
      sessionStorage.setItem('user_id', userId);
    }
    else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', res.data.role);
      sessionStorage.setItem('email', res.data.email);
      sessionStorage.setItem('user_id', userId);
    }

    router.push('/dashboard');
  } catch (e) {
    console.error('Login error:', e);
    error.value = e.response?.data?.error || 'Błąd logowania';
  }
};
</script>

<template>
  <div class="login-container">
    <h1 class="title">Automatyzacja back-office</h1>

    <div class="login-card">
      <h2 class="form-header">Logowanie</h2>

      <input v-model="email" type="email" placeholder="Email" class="input form-control" />
      <input v-model="password" type="password" placeholder="Hasło" class="input form-control" />

      <label class="checkbox">
        <input type="checkbox" v-model="remember" />
        Zapamiętaj mnie
      </label>

      <button type="button" @click="login" class="nav-button">Zaloguj się</button>

      <p v-if="error" class="error">{{ error }}</p>

      <p class="register-link">
        Nie masz konta?
        <router-link to="/register">Zarejestruj się</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
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

.login-card {
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

.input {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #3498db;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.nav-button {
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

.nav-button:hover {
  background-color: #2980b9;
}

.error {
  color: red;
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
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

.form-control {
  max-width: 300px;
  margin: 0 auto 1rem;
  display: block;
}

</style>
