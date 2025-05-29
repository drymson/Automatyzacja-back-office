const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');
const bcrypt = require('bcrypt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  const JWT_SECRET = process.env.JWT_SECRET || 'webwizards';
  jwt.verify(token, JWT_SECRET, (err, user) => {
    console.log('VERIFY:', err, user);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get('/account', authenticateToken, async (req, res) => {
  try {
    console.log('Użytkownik z tokena:', req.user);

    const userId = req.user.userId || req.user.user_id || req.user.id;
    if (!userId) return res.status(401).json({ message: 'Brak id użytkownika w tokenie' });

    const user = await knex('users')
      .select('email', 'created_at', 'username')
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json({
      email: user.email,
      username: user.username,
      registeredAt: user.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.user_id || req.user.id;
    if (!userId) return res.status(401).json({ message: 'Brak id użytkownika w tokenie' });

    const deleted = await knex('users').where({ id: userId }).del();

    if (!deleted) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json({ message: 'Konto zostało usunięte' });
  } catch (err) {
    console.error('Błąd usuwania konta:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.put('/account/password', authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user.user_id || req.user.id;
  if (!userId) return res.status(401).json({ message: 'Brak id użytkownika w tokenie' });

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Brak starego lub nowego hasła' });
  }

  try {
    const user = await knex('users').where({ id: userId }).first();
    if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) return res.status(403).json({ message: 'Nieprawidłowe stare hasło' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: userId }).update({ password: hashedPassword });

    res.json({ message: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error('Błąd zmiany hasła:', err);
    res.status(500).json({ message: 'Błąd serwera przy zmianie hasła' });
  }
});

router.put('/account/username', authenticateToken, async (req, res) => {
  const userId = req.user.user_Id || req.user.user_id || req.user.id;
  if (!userId) return res.status(401).json({ message: 'Brak id użytkownika w tokenie' });

  const { username } = req.body;

  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Nazwa użytkownika musi mieć co najmniej 3 znaki' });
  }

  try {
    const existingUser = await knex('users').where({ username }).first();
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Nazwa użytkownika jest już zajęta' });
    }

    await knex('users').where({ id: userId }).update({ username });

    res.json({ message: 'Nazwa użytkownika została zaktualizowana' });
  } catch (err) {
    console.error('Błąd aktualizacji nazwy użytkownika:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
