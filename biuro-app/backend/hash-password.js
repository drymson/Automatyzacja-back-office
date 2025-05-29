const bcrypt = require('bcrypt');
bcrypt.compare('mojehaslo', '$2b$10$DHAt8P3va6m1B4BW/ROcXegTp93j2g198Gy9TYQGfjrlW1HG6mzVG').then(console.log);

async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Hashed password:', hash);
}

const passwordToHash = process.argv[2];

if (!passwordToHash) {
  console.error('Podaj hasło jako argument, np. node hash-password.js mojehaslo');
  process.exit(1);
}

hashPassword(passwordToHash);
