const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'webwizards';

router.get('/check-email', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Brak emaila' });

  try {
    const existingUser = await knex('users').where({ email }).first();
    res.json({ exists: !!existingUser });
  } catch (err) {
    console.error('Błąd sprawdzania emaila:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

router.get('/check-username', async (req, res) => {
  const username = req.query.username;
  if (!username || username.length < 3) {
    return res.status(400).json({ message: 'Nieprawidłowa nazwa użytkownika' });
  }
  try {
    const exists = await knex('users').where({ username }).first();
    res.json({ exists: !!exists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.post('/register',
  body('email').isEmail().withMessage('Nieprawidłowy email'),
  body('username').isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
  body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Nieprawidłowe dane', details: errors.array() });
    }

    const { email, username, password } = req.body;
    try {
      const existingEmail = await knex('users').where({ email }).first();
      if (existingEmail) return res.status(400).json({ error: 'Email już istnieje' });

      const existingUsername = await knex('users').where({ username }).first();
      if (existingUsername) return res.status(400).json({ error: 'Nazwa użytkownika już istnieje' });

      const hashedPassword = await bcrypt.hash(password, 10);

      await knex('users').insert({ email, username, password: hashedPassword, role: 'user' });

      res.status(201).json({ message: 'Użytkownik utworzony' });
    } catch (err) {
      console.error('Błąd rejestracji:', err);
      res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    }
  }
);

router.post('/login',
  body('email').isEmail().withMessage('Podaj poprawny email'),
  body('password').notEmpty().withMessage('Hasło jest wymagane'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Nieprawidłowe dane logowania', details: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await knex('users').where({ email }).first();
      if (!user) return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });

      const token = jwt.sign(
        { user_id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.json({ token, user_id: user.id, role: user.role, email: user.email });
    } catch (err) {
      console.error('Błąd logowania:', err);
      res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    }
  }
);

function authMiddleware(requiredRole = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Brak tokena' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Brak tokena' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;

      if (requiredRole && payload.role !== requiredRole) return res.status(403).json({ error: 'Brak dostępu' });

      next();
    } catch {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }
  };
}

module.exports = router;
