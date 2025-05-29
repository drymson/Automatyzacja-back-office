const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email i hasło są wymagane' });

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser)
      return res.status(400).json({ error: 'Email już istnieje' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db('users').insert({
      email,
      password: hashedPassword,
      role: 'user',
    });

    res.status(201).json({ message: 'Użytkownik utworzony' });
  } catch (err) {
    console.error('Błąd rejestracji:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email i hasło są wymagane' });

  try {
    const user = await db('users').where({ email }).first();
    if (!user)
      return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    console.error('Błąd logowania:', err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
