import cors from "cors";

export const corsMiddleware = cors({
        origin: "http://127.0.01:8080",
        optionsSuccessStatus: 200,
});
