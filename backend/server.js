/**
 * server.js – Anvi Stay Backend API
 *
 * Entry point: loads env, connects to MongoDB, mounts routes, starts Express.
 * Includes: Helmet, Morgan, CORS lockdown, Rate Limiting, Swagger Docs, File Uploads,
 *           NoSQL Injection Sanitization, Env Validation
 */

require('dotenv').config();

// ══════════════════════════════════════
// ── Env Variable Validation (fail fast) ──
// ══════════════════════════════════════
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
REQUIRED_ENV.forEach((key) => {
    if (!process.env[key]) {
        console.error(`[Server] ❌ FATAL: Missing required environment variable: ${key}`);
        console.error('[Server] Please check your .env file and restart.');
        process.exit(1);
    }
});
console.log('[Server] ✅ Environment variables validated.');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// ── Connect to MongoDB ──
connectDB();

const app = express();

// ══════════════════════════════════════
// ── Security Middleware ──
// ══════════════════════════════════════

// Helmet – sets various security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images/files
    contentSecurityPolicy: false, // disable CSP for now (frontend uses CDNs)
}));

// CORS – restrict to allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500').split(',');
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            if (process.env.NODE_ENV === 'production') {
                callback(new Error(`CORS: Origin "${origin}" not allowed`));
            } else {
                // In development, allow all origins with a warning
                console.warn(`[CORS] Warning: Allowing unlisted origin in dev mode: ${origin}`);
                callback(null, true);
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ══════════════════════════════════════
// ── Logging Middleware ──
// ══════════════════════════════════════

// Morgan – HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ══════════════════════════════════════
// ── Body Parsing ──
// ══════════════════════════════════════

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── NoSQL Injection Sanitization ──
// Replaces $ and . in request body/params/query to prevent injection
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`[Security] Sanitized NoSQL injection attempt in ${key} from IP: ${req.ip}`);
    },
}));

// ── XSS Protection ──
const xss = require('xss-clean');
app.use(xss());

// ── Prevent HTTP Parameter Pollution ──
const hpp = require('hpp');
app.use(hpp());

// ── IP Blacklist check ──
const ipBlacklist = require('./middleware/ipBlacklist');
app.use(ipBlacklist);

// ── Honeypot Trap Route ──
app.all('/api/admin/debug-export', async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const BlacklistedIP = require('./models/BlacklistedIP');
        await BlacklistedIP.findOneAndUpdate(
            { ipAddress: ip },
            { ipAddress: ip, reason: 'Honeypot Trap Triggered on /api/admin/debug-export' },
            { upsert: true }
        );
        console.warn(`[Security] HONEYPOT TRIGGERED! Banning IP: ${ip}`);
        res.status(403).json({ success: false, message: 'Access denied.' });
    } catch (err) {
        res.status(403).json({ success: false, message: 'Access denied.' });
    }
});

// ── Serve uploaded files statically ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ══════════════════════════════════════
// ── Rate Limiting ──
// ══════════════════════════════════════

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Strict rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // max 20 login attempts per 15 min
    message: { success: false, message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/admin/login', authLimiter);
app.use('/api/rooms/tenant-login', authLimiter);

// ══════════════════════════════════════
// ── Swagger API Documentation ──
// ══════════════════════════════════════

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Anvi Stay API',
            version: '2.0.0',
            description: 'Backend API for Anvi Stay Property Management System',
            contact: { name: 'Anvi Stay', email: 'anvistay.official@gmail.com' },
        },
        servers: [
            { url: `http://localhost:${process.env.PORT || 5001}`, description: 'Development' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Anvi Stay API Docs',
}));

// ══════════════════════════════════════
// ── API Routes ──
// ══════════════════════════════════════

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/housekeeping', require('./routes/housekeepingRoutes'));
app.use('/api/agreements', require('./routes/agreementRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));

// ══════════════════════════════════════
// ── Health Check ──
// ══════════════════════════════════════

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Anvi Stay API is running 🚀',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()) + 's',
    });
});

// ══════════════════════════════════════
// ── 404 Handler ──
// ══════════════════════════════════════

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ══════════════════════════════════════
// ── Global Error Handler ──
// ══════════════════════════════════════

app.use((err, req, res, next) => {
    console.error('[Server] Unhandled error:', err.stack || err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error',
    });
});

// ══════════════════════════════════════
// ── Start Server ──
// ══════════════════════════════════════

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`[Server] Anvi Stay API v2.0 running on port ${PORT}`);
    console.log(`[Server] API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);

    // ── Start Cron Jobs ──
    const initializeCronJobs = require('./cronJobs');
    initializeCronJobs();
});
