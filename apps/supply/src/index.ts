import express from "express";
import appRoutes from "./routes/index-routes";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/error";
import { corsMiddleware } from "./middlewares/cors";
import { limiterMiddleware } from "./middlewares/rate-limit";
import { sessionMiddleware } from "./middlewares/session";

const app = express();

app.use(sessionMiddleware);
app.use(corsMiddleware);
app.use(limiterMiddleware);

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use("/api/v1", appRoutes);

app.use(errorHandler);

app.listen(8080, () => {
        console.log("Supply App running on port 8080...");
});
