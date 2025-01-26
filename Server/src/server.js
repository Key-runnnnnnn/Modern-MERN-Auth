import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


// Initialize packages
const app = express();
dotenv.config();

// Exported variables
const PORT = process.env.PORT || 3000;
connectDB();
const alloweOrigins = ['http://localhost:5173'];

// Middlewares
app.use(express.json()); // for parsing application/json
app.use(cookieParser());
app.use(cors({
    origin: alloweOrigins,
    credentials: true
}));

// API end points
app.get('/', (req, res) => {
    res.send("API is running....");
});

// Auth end points
app.use('/api/auth', authRoutes);

// user end points
app.use('/api/user', userRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

// Error handling for port conflicts
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use another port.`);
        process.exit(1);
    }
});
