import express from "express";
import path from "path";
const app = express();

app.use(express.static("."));

app.get("/", (req, res) => {
  res.type("html").sendFile(path.resolve("./landingpage.html"));
})

app.listen(3000, () => {
  console.log("App running at http://localhost:3000");
});
