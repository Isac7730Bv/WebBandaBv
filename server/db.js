import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const uploadsDir = path.join(dataDir, "uploads", "scores");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const postsUploadsDir = path.join(dataDir, "uploads", "posts");

if (!fs.existsSync(postsUploadsDir)) {
  fs.mkdirSync(postsUploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, "banda.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS instruments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    carnet TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    instrumentId TEXT REFERENCES instruments(id) ON DELETE SET NULL,
    isActive INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS attendance (
    date TEXT NOT NULL,
    userId TEXT NOT NULL,
    status TEXT NOT NULL,
    PRIMARY KEY (date, userId)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instrumentId TEXT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    fileName TEXT NOT NULL,
    originalFileName TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instrumentId TEXT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    mediaType TEXT NOT NULL CHECK (mediaType IN ('AUDIO', 'VIDEO')),
    url TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Migración defensiva: si la base de datos ya existía de una versión
// anterior (sin la tabla instruments/columna instrumentId, o sin la
// columna de partituras vistas), la ponemos al día sin perder los datos
// que ya tenía.
const userColumns = db.prepare("PRAGMA table_info(users)").all().map((col) => col.name);

if (!userColumns.includes("instrumentId")) {
  db.exec("ALTER TABLE users ADD COLUMN instrumentId TEXT REFERENCES instruments(id) ON DELETE SET NULL");
}

if (!userColumns.includes("lastSeenScoresAt")) {
  db.exec("ALTER TABLE users ADD COLUMN lastSeenScoresAt TEXT");
}

if (!userColumns.includes("lastSeenMediaAt")) {
  db.exec("ALTER TABLE users ADD COLUMN lastSeenMediaAt TEXT");
}

// ---------- Semillas (solo si las tablas están vacías) ----------

const findOrCreateInstrument = (() => {
  const findByName = db.prepare("SELECT id FROM instruments WHERE name = ?");
  const insert = db.prepare("INSERT INTO instruments (id, name, code) VALUES (?, ?, ?)");
  let counter = 0;

  return (name, code) => {
    const existing = findByName.get(name);
    if (existing) return existing.id;

    counter += 1;
    const id = `instrument-${Date.now()}-${counter}`;
    insert.run(id, name, code ?? `${name.slice(0, 4).toUpperCase()}-${String(counter).padStart(3, "0")}`);
    return id;
  };
})();

const instrumentCount = db.prepare("SELECT COUNT(*) AS count FROM instruments").get().count;

if (instrumentCount === 0) {
  findOrCreateInstrument("Clarinete", "CLAR-001");
  findOrCreateInstrument("Tambor", "TAMB-001");
  console.log("Instrumentos de ejemplo creados: Clarinete, Tambor.");
}

// Primera vez que se levanta el servidor: sembrar la base de datos con los
// usuarios de ejemplo que venían en src/data/users.json, para no perder
// los datos de prueba originales del proyecto.
const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

if (userCount === 0) {
  const seedPath = path.join(__dirname, "..", "src", "data", "users.json");

  if (fs.existsSync(seedPath)) {
    const seedUsers = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

    const insert = db.prepare(`
      INSERT INTO users (id, name, carnet, password, role, instrumentId, isActive)
      VALUES (@id, @name, @carnet, @password, @role, @instrumentId, @isActive)
    `);

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        // Los usuarios de ejemplo antiguos traían el instrumento como texto
        // suelto (por ejemplo "Trompeta"); lo convertimos en un instrumento
        // real de la tabla instruments para que quede igual de funcional.
        const instrumentId = user.instrument
          ? findOrCreateInstrument(user.instrument, user.instrumentCode)
          : null;

        insert.run({
          id: user.id,
          name: user.name,
          carnet: user.carnet,
          password: user.password,
          role: user.role,
          instrumentId,
          isActive: user.isActive === false ? 0 : 1,
        });
      }
    });

    insertMany(seedUsers);
    console.log(`Base de datos inicializada con ${seedUsers.length} usuario(s) de ejemplo.`);
  }
}

export default db;
