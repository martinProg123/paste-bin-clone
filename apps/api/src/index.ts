import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // ESM-specific __dirname replacement
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load .env from monorepo root
// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();

// 1. Configure CORS options
const corsOptions = {
  // Point this to your React (Vite) development server
  origin: `http://localhost:${process.env.VITE_PORT || '4614'}`, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if you plan to use Cookies/Sessions later
};

// 2. Apply middleware
app.use(cors(corsOptions));

// 3. Built-in body parsers
app.use(express.json());

// 4. Example Route
app.get('/hi', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4614;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});