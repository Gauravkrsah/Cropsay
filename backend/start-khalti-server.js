// Express server to expose Khalti payment endpoints
import express from 'express';
import khaltiRoutes from './khalti.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', khaltiRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Khalti backend server running on port ${PORT}`);
});
