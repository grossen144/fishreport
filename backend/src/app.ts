import { createUserRoutes } from './routes/users';

// Register routes
app.use('/api/users', createUserRoutes(pool));

// ... rest of your app setup ... 