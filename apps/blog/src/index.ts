import express from "express";
import appRoutes from "./routes/index-routes";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/error";

const app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use("/api/v1", appRoutes);

app.use(errorHandler);

app.listen(3000, () => {
        console.log("CP1 running on port 3000...");
});
