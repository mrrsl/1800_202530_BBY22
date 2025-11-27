import express from "express";
import path from "path";

const server = express();

server.use(express.static("./public/"));
server.use(express.static("./src/"));

server.get("/", (req, res) => {
    res.header("Allow-Access-Control-Origin", "*")
        .type("html").sendFile(path.resolve("./src/landingpage.html"));
});

// Access page scripts
server.get("/js/:script", (req, res) => {
    res.header("Allow-Access-Control-Origin", "*")
        .sendFile(path.resolve(path.join("./src/js/", req.params.script)));
});

// Access library scripts
server.get("/lib/:script", (req, res) => {
    res.header("Allow-Access-Control-Origin", "*")
        .sendFile(path.resolve(path.join("./src/lib/", req.params.script)));
});

// Calendar app script accesc
server.get("/scripts/:script", (req, res) => {
    res.sendFile(path.resolve(path.join("./src/js/", req.params.script)));
});


server.listen(3000);