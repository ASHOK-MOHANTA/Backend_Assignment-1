import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '..', 'db.json');


async function ensureDb() {
try {
await fs.access(DB_PATH);
} catch {
const initial = { todos: [] };
await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
}
}


export async function readDb() {
await ensureDb();
const raw = await fs.readFile(DB_PATH, 'utf-8');
try {
return JSON.parse(raw || '{"todos":[]}');
} catch {
return { todos: [] };
}
}


export async function writeDb(data) {
await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}