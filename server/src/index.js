import express from 'express';
import dotenv from 'dotenv';
import Configuration from './config/configuration.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(express.json());
app.use(Configuration.Cors);

// Connect to MongoDB
Configuration.connectDB();

// Route integration
Configuration.configRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
