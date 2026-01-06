import express from "express";
import appRoutes from "./routes/index-routes";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use("/api/v1", appRoutes);

app.listen(3000, () => {
        console.log("CP1 running on port 3000...");
});
