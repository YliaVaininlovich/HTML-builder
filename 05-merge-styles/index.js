const fs = require("fs");
const path = require("path");

async function makeBundle(src) {
  let entries = await fs.promises.readdir(src, { withFileTypes: true });
  const writeStream = fs.createWriteStream(
    path.join(__dirname, "project-dist", "bundle.css")
  );
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    if (entry.isFile() && path.extname(entry.name) === ".css") {
      const bundle = [];
      const readStream = fs.createReadStream(srcPath, "utf-8");
      readStream.on("data", (chunk) => bundle.push(chunk));
      readStream.on("end", () =>
        bundle.forEach((item) => writeStream.write(`${item}\n`))
      );
    }
  }
}

makeBundle(path.join(__dirname, "styles"));
