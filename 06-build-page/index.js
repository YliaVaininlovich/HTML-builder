const fs = require("fs");
const path = require("path");

async function readComponents(src) {
  const templateReadStream = fs.createReadStream(
    path.join(__dirname, "template.html"),
    "utf-8"
  );
  await fs.promises.mkdir(path.join(__dirname, "project-dist"), {
    recursive: true,
  });
  let entries = await fs.promises.readdir(src, { withFileTypes: true });
  let template = "";
  templateReadStream.on("data", (chunk) => (template += chunk));
  templateReadStream.on("end", () => {
    const regexp = /{{(.*?)}}/g;
    const tags = template.match(regexp);
    tags.forEach((item) => {
      for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        if (
          entry.isFile() &&
          path.extname(entry.name) === ".html" &&
          `{{${entry.name.split(".")[0]}}}` === item
        ) {
          let component = "";
          const readStream = fs.createReadStream(srcPath, "utf-8");
          readStream.on("data", (chunk) => (component += chunk));
          readStream.on("end", () => {
            template = template.replace(item, component);
            const writeStream = fs.createWriteStream(
              path.join(__dirname, "project-dist", "index.html")
            );
            writeStream.write(template);
          });
        }
      }
    });
  });
}

async function makeBundle(src) {
  let entries = await fs.promises.readdir(src, { withFileTypes: true });
  const writeStream = fs.createWriteStream(
    path.join(__dirname, "project-dist", "style.css")
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

async function copyDir(src, copy) {
  await fs.promises.mkdir(copy, { recursive: true });
  let entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let copyPath = path.join(copy, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, copyPath);
    } else {
      await fs.promises.copyFile(srcPath, copyPath);
    }
  }
}

function copyUpdatedDir(src, copy) {
  fs.rm(copy, { recursive: true, force: true }, () => copyDir(src, copy));
}

readComponents(path.join(__dirname, "components"));
makeBundle(path.join(__dirname, "styles"));
copyUpdatedDir(
  path.join(__dirname, "assets"),
  path.join(__dirname, "project-dist", "assets")
);
