
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

// Middlewares
app.use(express.json());

// API routes
app.use('/api', routes);

export default app;
