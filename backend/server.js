const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const grainRoutes = require('./routes/grainRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const escrowRoutes = require('./routes/escrowRoutes');

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  
  // Render sets the PORT environment variable automatically. 
  // We add a fallback to 3000 for local development.
  const PORT = process.env.PORT || 3000;

  // Connect to Database with error handling
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Optional: Exit if DB is critical for startup
    // process.exit(1);
  }

  // Middleware
  // For production, you can restrict CORS to your frontend URL:
  // app.use(cors({ origin: 'https://your-frontend.onrender.com' }));
  app.use(cors()); 
  app.use(express.json());

  // Root & Health Check (Render uses these to check if your app is alive)
  app.get('/', (req, res) => {
    res.send('GrainTrust AI Backend Running');
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'GrainTrust AI API is running',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/grains", grainRoutes);
  app.use("/api/escrow", escrowRoutes);
  app.use("/api/notification", notificationRoutes);

  // Global Error Handler (Prevents server from crashing on unhandled errors)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // CRITICAL: Bind to '0.0.0.0' so Render's proxy can route traffic to your app
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();