import 'dotenv/config';
import {connectDB} from './db/index.js';
import {app} from './app.js';
import {isDemoMode} from './utils/demoMode.js';

const port = Number(process.env.PORT) || 2000;

try {
    if (!isDemoMode && !process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not configured');
    }
    await connectDB();
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}${isDemoMode ? ' (demo mode)' : ''}`);
    });
    server.on('error', (error) => {
        console.error('Failed to start server:', error);
        process.exitCode = 1;
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
}