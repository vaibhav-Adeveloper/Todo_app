import mongoose from 'mongoose';
import { isDemoMode } from '../utils/demoMode.js';

const connectDB = async() => {
    if (isDemoMode) {
        console.log('MongoDB URI not configured; starting in demo mode');
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'todo_app',
    });
    console.log('MongoDB connected successfully');
};

export {connectDB};