import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 