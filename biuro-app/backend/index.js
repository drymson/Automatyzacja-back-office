require('dotenv').config()

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors({
  origin: 'http://localhost:4000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

const officeResourcesRoutes = require('./routes/officeResources');
const suppliesRoutes = require('./routes/supplies');
const tasksRoutes = require('./routes/tasks');
const ticketsRoutes = require('./routes/tickets');
const assetsRoutes = require('./routes/assets');
const accountRoutes = require('./routes/account');

app.use('/api/office-resources', officeResourcesRoutes);
app.use('/api/supplies', suppliesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/auth', authRouter);
app.use('/api', accountRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
