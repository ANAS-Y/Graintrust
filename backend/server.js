const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const grainRoutes = require('./routes/grainRoutes');
const notificationRoutes = require('./routes/notificationRoutes');;
const escrowRoutes = require('./routes/escrowRoutes');

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT;

  await connectDB();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
  res.send('GrainTrust AI Backend Running');
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GrainTrust AI API is running' });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/grains", grainRoutes);
  app.use("/api/escrow", escrowRoutes);
  app.use("/api/notification", notificationRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();