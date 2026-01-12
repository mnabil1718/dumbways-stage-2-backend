import session from "express-session";
import "dotenv/config";

const sessionMiddleware = session({
        secret: config.session.secret,
        resave: false,
        saveUninitialized: true,
});
