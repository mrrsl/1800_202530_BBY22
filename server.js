import express from "express";
import path from "path";
import fs from "fs/promises";

const server = express();

server.get("/", (req, res) => {
    res.header("Allow-Access-Control-Origin", "*")
        .type("html").sendFile(path.resolve("./src/landingpage.html"));
});

// serve html files
server.get(/^.+\.html$/, (req, res) => {
    const filenameRe = /\w+\.html$/;
    let match = req.originalUrl.match(filenameRe);
    if (match != null) {
        res.type("text/html").sendFile(
            path.resolve(path.join("./src", match[0]))
        );
    } else {
        res.status(403).end();
    }
});

// serve library js
server.get(/lib\/\w+\.js/, (req, res) => {
    const jsFile = req.originalUrl.match(/\w+\.js/);
    fs.readFile(path.resolve(path.join("./src/lib", jsFile[0])))
        .then(async buff => buff.toString("utf8"))
        .then(jsText => {
            jsText = replaceBareImports(jsText);
            res.type("text/javascript").send(jsText);
        });
});

// serve frontend js
server.get(/js\/\w+\.js/, (req, res) => {
    const jsFile = req.originalUrl.match(/\w+\.js/);
    fs.readFile(path.resolve(path.join("./src/js", jsFile[0])))
        .then(async buff => buff.toString("utf8"))
        .then(jsText => {
            jsText = replaceBareImports(jsText);
            res.type("text/javascript").send(jsText);
        });
});

/**
 * Replaces the node-only firebase/* bare imports in Javascript to Google CDN links for compatibility with espress environments.
 * @param {String} jsdata String from a Javascript file.
 * @returns Script string with bare imports replaced with CDN URLs.
 */
function replaceBareImports(jsdata) {
    jsdata = jsdata.replace("firebase/app", "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js");
    jsdata = jsdata.replace("firebase/auth", "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
    jsdata = jsdata.replace("firebase/firestore", "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js");
    return jsdata;
}

server.use(express.static("./public/"));

server.listen(3000);