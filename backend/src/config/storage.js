const fs = require("fs");
const path = require("path");

// Базовые пути
const STATIC_PATH = path.join(__dirname, "..", "static");
const IMG_PATH = path.join(STATIC_PATH, "img");
const DISCIPLINE_PATH = path.join(IMG_PATH, "discipline");

// Default image URL (для БД)
const DEFAULT_DISCIPLINE_IMAGE = "/static/img/discipline/default.png";

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Создаём папки при запуске проекта
function createFolders() {
    ensureDir(STATIC_PATH);
    ensureDir(IMG_PATH);
    ensureDir(DISCIPLINE_PATH);
}


module.exports = {
    STATIC_PATH,
    IMG_PATH,
    DISCIPLINE_PATH,
    DEFAULT_DISCIPLINE_IMAGE,
    createFolders
};