import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export const getFilePath = (filename) => path.join(dataDir, filename);

export const readJSON = (filename, defaultVal = []) => {
  try {
    const file = getFilePath(filename);
    if (!fs.existsSync(file)) return defaultVal;
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
};

export const writeJSON = (filename, data) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
};

export const getCurrentUser = () => {
  const users = readJSON('users.json', []);
  const current = users.find(u => u.isCurrent);
  return current || users[0] || null;
};

