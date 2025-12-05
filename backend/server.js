import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: join(__dirname, '.env') });

// Debug: Check if env vars are loaded
console.log('Environment check:');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Loaded' : '✗ Missing');

import express from 'express';
import cors from 'cors';
import { initializeFirebase } from './config/firebase.js';
import cityRoutes from './routes/cities.js';
import contentRoutes from './routes/content.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase. Server will not start.');
  process.exit(1);
}

// Routes
app.use('/api/cities', cityRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🌐 GeoCities AI server running on port ${PORT}`);
});
