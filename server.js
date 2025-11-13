import express from "express";
import path from "path";

const server = express();

server.use(express.static("./src/"));

server.get("/", (req, res) => {
    res.type("html").sendFile(path.resolve("./src/landingpage.html"));
});
server.get("/styles/:css", (req, res) => {
    res.type("css").sendFile(path.resolve(path.join("./public/styles/", req.params.css)));
});
server.get("/js/:script", (req, res) => {
    res.sendFile(path.resolve(path.join("./src/js/", req.params.script)));
});
server.get("/scripts/:script", (req, res) => {
    res.sendFile(path.resolve(path.join("./src/js/", req.params.script)));
});

server.get("/img/:filename", (req, res) => {
    res.sendFile(path.resolve(path.join("./public/img/", req.params.filename)));
});

server.listen(3000);