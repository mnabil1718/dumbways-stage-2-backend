import express from 'express'

const app = express();

app.get("/", (req, res) => {
        res.send("CP2 OK");
})

app.listen(3000, () => {
        console.log("CP2 running on port 3000");

})
