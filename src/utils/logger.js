import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("src/logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getLogFile() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  return path.join(LOG_DIR, `${dd}${mm}${yyyy}.log`);
}

function write(level, message, meta = {}) {
  const time = new Date().toISOString();
  const line = JSON.stringify({
    time,
    level,
    message,
    ...meta,
  });

  fs.appendFile(getLogFile(), line + "\n", () => {});
}

export const logger = {
  info: (msg, meta) => write("INFO", msg, meta),
  warn: (msg, meta) => write("WARN", msg, meta),
  error: (msg, meta) => write("ERROR", msg, meta),
};
