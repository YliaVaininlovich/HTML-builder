const fs = require("fs");
const path = require("path");
const rS = new fs.ReadStream(path.join(__dirname, "text.txt"), "utf-8");

let data = "";

rS.on("data", (chunk) => (data += chunk));
rS.on("end", () => console.log(data));
rS.on("error", (err) => console.log("Error", err.message));
