import express from "express";

const app = express();

app.get("/", (_req, res) => {
        res.send("CP1 OK");
});

app.listen(3000, () => {
        console.log("CP1 running on port 3000");
});
