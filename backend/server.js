import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import cityRoutes from './routes/cities.js';
import contentRoutes from './routes/content.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

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
