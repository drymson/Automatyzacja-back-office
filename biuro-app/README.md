# Instrukcja uruchomienia projektu **biuro-app**

## 1. Pobranie projektu

Z pobranego archiwum GitHub rozpakuj projekt i przejdź do katalogu `biuro-app`.

Przeczytaj plik `README.md` znajdujący się w katalogu `biuro-app`.

---

## 2. Instalacja zależności

W katalogu `biuro-app`:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 3. Konfiguracja bazy danych

1. Utwórz lokalną bazę danych PostgreSQL o nazwie `biuro_app`.
2. Upewnij się, że masz użytkownika `postgres` z hasłem `webwizards`, lub zmodyfikuj plik `.env` według własnych danych.

Plik `.env` znajduje się w katalogu `backend/.env` i powinien wyglądać np. tak:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=webwizards
DB_NAME=biuro_app
PORT=4000
```

> Dostosuj plik `.env` do swoich ustawień bazy danych, jeśli są inne.

---

## 4. Migracje bazy danych

W katalogu `backend` uruchom migracje, aby utworzyć tabele w bazie danych:

```bash
npx knex migrate:latest --knexfile db/knexfile.js
```

---

## 5. Budowanie frontendu (opcjonalnie)

Jeśli dokonasz zmian w frontendzie i chcesz wygenerować wersję produkcyjną, przejdź do katalogu `frontend` i wykonaj:

```bash
npm run build
```

Wygenerowane pliki znajdziesz w folderze `frontend/dist`.

---

## 6. Uruchomienie aplikacji

W katalogu `backend` uruchom serwer Node.js:

```bash
node index.js
```

Aplikacja będzie dostępna pod adresem:

```
http://localhost:4000
```

Frontend i backend są zintegrowane i dostępne pod tym samym adresem.
