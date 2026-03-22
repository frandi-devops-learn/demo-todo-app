const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./database');
const todosRouter = require('./routes/todos');
const healthRouter = require('./routes/health');

// --- AUTOMATION: Load Telegram Background Jobs ---
require('./jobs/deadlineJob'); 

require('./jobs/dailySummary');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serves your index.html and style.css

// --- Main Routes ---
app.use('/api/todos', todosRouter);
app.use('/health', healthRouter);

// --- 404 Handler ---
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found in registry_" });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(' [SYSTEM ERROR] ', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// --- Server Lifecycle ---
async function startServer() {
    try {
        // Test database connectivity
        await sequelize.authenticate();
        console.log('✅ [DATABASE] Connected to PostgreSQL successfully!');
        
        // Sync models
        // Using alter: false for safety; change to true only if you update the Todo model
        await sequelize.sync({ alter: false }); 
        console.log('📦 [DATABASE] Schema synced.');

        app.listen(PORT, () => {
            console.log(`🚀 [SERVER] System online at http://localhost:${PORT}`);
            console.log(`📂 [STATIC] Serving frontend from /public`);
            console.log(`🤖 [BOT] Telegram monitoring service initiated_`);
        });
    } catch (err) {
        console.error('❌ [CRITICAL] Failed to initialize system:', err);
        process.exit(1);
    }
}

startServer();