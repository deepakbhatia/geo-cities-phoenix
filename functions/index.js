const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// CORS configuration - allow all origins for Firebase Hosting
app.use(cors({ origin: true }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const cityRoutes = require('./routes/cities');
const contentRoutes = require('./routes/content');
const aiRoutes = require('./routes/ai');

// Mount routes
app.use('/api/cities', cityRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Export Express app as Cloud Function
exports.api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
    minInstances: 0,
    maxInstances: 10
  })
  .https.onRequest(app);
