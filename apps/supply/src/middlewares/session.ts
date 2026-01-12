import session from "express-session";
import "dotenv/config";

export const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET ?? 'session-secret',
        resave: false,
        saveUninitialized: true,
});
