import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import cors from 'cors';
// import userRouter from './routes/user.route.js';
import todoRouter from './routes/todo.route.js';
import { ApiError } from './utils/apiError.js';
import { ApiResponse } from './utils/apiResponse.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: '1mb' }));
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies
app.use(cookieParser());
// Middleware for allowing CORS
const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({
    origin: configuredOrigins?.length && !configuredOrigins.includes('*')
        ? configuredOrigins
        : true,
    credentials: true,
}));

// sign-up route
app.use('/api/v1/users', userRouter);

// todo routes
app.use('/api/v1/todos', todoRouter);

app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
});

app.use((error, req, res, next) => {
    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || 'Internal server error';

    if (error.name === 'MulterError') {
        statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        message = error.code === 'LIMIT_FILE_SIZE'
            ? 'Profile image must be 5 MB or smaller'
            : 'Invalid uploaded file';
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
    } else if (error.code === 11000) {
        statusCode = 409;
        message = 'A user with this email or username already exists';
    }

    if (statusCode >= 500) {
        console.error(error);
        message = 'Internal server error';
    }

    res.status(statusCode).json(
        new ApiResponse(statusCode, null, message),
    );
});

export {app};