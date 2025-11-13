import express from "express";
import path from "path";

const server = express();

server.use(express.static("./src/public"));
server.use(express.static("./src/"));

server.get("/", (req, res) => {
    res.sendFile(path.resolve("./src/landingpage.html"));
});

server.listen(3000);