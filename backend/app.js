import express from 'express';
import cors from 'cors';
import { env } from './utils/env.js';
import { connectDB } from './db/dbconnect.js';

// Import Routes
import userRouter from './routes/user.routes.js';
import courseRouter from './routes/course.routes.js';
import categoryRouter from './routes/category.routes.js';
import enrollmentRouter from './routes/enrollment.routes.js';
import paymentRouter from './routes/payment.routes.js';
import progressRouter from './routes/progress.routes.js';
import reviewRouter from './routes/review.routes.js';
import sectionRouter from './routes/section.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import lectureRouter from './routes/lecture.routes.js';
import certificateRouter from './routes/certificate.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Simple Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static('uploads'));

// Connect Database
connectDB();

// Routes
app.use('/api/user', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/progress', progressRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/sections', sectionRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/lectures', lectureRouter);
app.use('/api/certificates', certificateRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${env.NODE_ENV}`);
});

export { app };
