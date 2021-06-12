const path = require("path");
const fs = require("fs");

const postsFolder = path.join(__dirname, "../src/posts");
const distFolder = path.join(__dirname, "../src/data/posts.json");

function read(filePath) {
  let fileData = null;
  try {
    fileData = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    throw err;
  }
  return fileData.split("\n");
}

function getIndexes(arr) {
  return arr.reduce((prev, value, index) => {
    if (/^---/.test(value)) prev.push(index);
    return prev;
  }, []);
}

function getMetada(arr, indexes) {
  let metadata = {};

  arr
    .slice(indexes[0] + 1, indexes[1])
    .map((data) => data.split(": "))
    .map(([key, value]) => (metadata[key] = value));

  return metadata;
}

function getContent(arr, indexes) {
  return arr.slice(indexes[1] + 1, arr.length).join("\n");
}

function parse(arr) {
  const indexes = getIndexes(arr);

  const metadata = getMetada(arr, indexes);
  const content = getContent(arr, indexes);

  return { ...metadata, content };
}

function write(posts) {
  let data = JSON.stringify(posts);
  fs.writeFileSync(distFolder, data);
}

write(
  fs
    .readdirSync(postsFolder)
    .map((fileName) => path.join(postsFolder, fileName))
    .filter((fileName) => fs.lstatSync(fileName).isFile())
    .map((file) => read(file))
    .map((arr) => parse(arr))
);
