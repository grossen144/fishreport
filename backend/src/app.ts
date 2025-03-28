import { createUserRoutes } from "./routes/usersRoutes";

// Register routes
app.use("/api/users", createUserRoutes(pool));

// ... rest of your app setup ...
