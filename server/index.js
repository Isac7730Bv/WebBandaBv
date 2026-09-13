import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db, { uploadsDir, postsUploadsDir } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

const app = express();
app.use(cors());
app.use(express.json());

// Sirve el frontend ya compilado (npm run build) para que un solo proceso
// (este servidor) entregue backend + frontend + base de datos juntos.
// Útil para demos portátiles: no hace falta correr Vite por separado.
app.use(express.static(distPath));

// Sirve las imágenes que el administrador sube dentro de las noticias/posts,
// para que se puedan mostrar con <img src="/uploads/posts/..."> en el texto.
app.use("/uploads/posts", express.static(postsUploadsDir));

const toPublicUser = (row) => ({
  id: row.id,
  name: row.name,
  carnet: row.carnet,
  role: row.role,
  instrumentId: row.instrumentId ?? undefined,
  instrument: row.instrumentName ?? undefined,
  instrumentCode: row.instrumentCode ?? undefined,
  isActive: row.isActive === 1,
});

const toPublicInstrument = (row) => ({
  id: row.id,
  name: row.name,
  code: row.code,
});

// Trae cada usuario junto con el nombre/código del instrumento asignado
// (si tiene), resolviéndolo por relación en vez de guardarlo repetido.
const USER_SELECT = `
  SELECT users.*, instruments.name AS instrumentName, instruments.code AS instrumentCode
  FROM users
  LEFT JOIN instruments ON users.instrumentId = instruments.id
`;

const getUserById = (id) => db.prepare(`${USER_SELECT} WHERE users.id = ?`).get(id);

const getMemberRows = () =>
  db.prepare(`${USER_SELECT} WHERE users.role = 'USUARIO'`).all();

const buildAttendanceForDate = (date) => {
  const members = getMemberRows();
  const entries = db.prepare("SELECT * FROM attendance WHERE date = ?").all(date);

  return members.map((member) => {
    const entry = entries.find((item) => item.userId === member.id);
    return {
      date,
      userId: member.id,
      status: entry?.status ?? "PENDIENTE",
    };
  });
};

// ---------- AUTH ----------

app.post("/api/auth/login", (req, res) => {
  const { carnet, password } = req.body ?? {};

  if (!carnet || !password) {
    return res.status(400).json({ error: "Carnet y contraseña son obligatorios." });
  }

  const row = db
    .prepare(`${USER_SELECT} WHERE users.carnet = ? AND users.password = ? AND users.isActive = 1`)
    .get(carnet, password);

  if (!row) {
    return res.status(401).json({ error: "El carnet o la contraseña son incorrectos." });
  }

  res.json({ user: toPublicUser(row) });
});

// ---------- MEMBERS (estudiantes) ----------

app.get("/api/members", (_req, res) => {
  res.json({ members: getMemberRows().map(toPublicUser) });
});

app.post("/api/members", (req, res) => {
  const { name, carnet, password, instrumentId } = req.body ?? {};

  if (!name || !carnet || !password || !instrumentId) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const instrument = db.prepare("SELECT id FROM instruments WHERE id = ?").get(instrumentId);
  if (!instrument) {
    return res.status(400).json({ error: "El instrumento seleccionado no existe." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE carnet = ?").get(carnet);
  if (existing) {
    return res.status(400).json({ error: "Ya existe un usuario con este carnet." });
  }

  const id = `user-${Date.now()}`;

  db.prepare(`
    INSERT INTO users (id, name, carnet, password, role, instrumentId, isActive)
    VALUES (?, ?, ?, ?, 'USUARIO', ?, 1)
  `).run(id, name, carnet, password, instrumentId);

  res.status(201).json({ user: toPublicUser(getUserById(id)) });
});

app.patch("/api/members/:id/toggle", (req, res) => {
  const { id } = req.params;
  const row = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'USUARIO'").get(id);

  if (!row) {
    return res.status(404).json({ error: "Estudiante no encontrado." });
  }

  const newActive = row.isActive === 1 ? 0 : 1;
  db.prepare("UPDATE users SET isActive = ? WHERE id = ?").run(newActive, id);

  res.json({ user: toPublicUser(getUserById(id)) });
});

// ---------- INSTRUMENTS (instrumentos) — solo el administrador los gestiona ----------

app.get("/api/instruments", (_req, res) => {
  const rows = db.prepare("SELECT * FROM instruments ORDER BY name").all();
  res.json({ instruments: rows.map(toPublicInstrument) });
});

app.post("/api/instruments", (req, res) => {
  const { name, code } = req.body ?? {};
  const trimmedName = name?.trim();
  const trimmedCode = code?.trim();

  if (!trimmedName || !trimmedCode) {
    return res.status(400).json({ error: "Nombre y código son obligatorios." });
  }

  const existing = db
    .prepare("SELECT id FROM instruments WHERE name = ? OR code = ?")
    .get(trimmedName, trimmedCode);

  if (existing) {
    return res.status(400).json({ error: "Ya existe un instrumento con ese nombre o código." });
  }

  const id = `instrument-${Date.now()}`;
  db.prepare("INSERT INTO instruments (id, name, code) VALUES (?, ?, ?)").run(
    id,
    trimmedName,
    trimmedCode,
  );

  const row = db.prepare("SELECT * FROM instruments WHERE id = ?").get(id);
  res.status(201).json({ instrument: toPublicInstrument(row) });
});

app.put("/api/instruments/:id", (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body ?? {};
  const trimmedName = name?.trim();
  const trimmedCode = code?.trim();

  const current = db.prepare("SELECT * FROM instruments WHERE id = ?").get(id);
  if (!current) {
    return res.status(404).json({ error: "Instrumento no encontrado." });
  }

  if (!trimmedName || !trimmedCode) {
    return res.status(400).json({ error: "Nombre y código son obligatorios." });
  }

  const existing = db
    .prepare("SELECT id FROM instruments WHERE (name = ? OR code = ?) AND id != ?")
    .get(trimmedName, trimmedCode, id);

  if (existing) {
    return res.status(400).json({ error: "Ya existe otro instrumento con ese nombre o código." });
  }

  db.prepare("UPDATE instruments SET name = ?, code = ? WHERE id = ?").run(
    trimmedName,
    trimmedCode,
    id,
  );

  const row = db.prepare("SELECT * FROM instruments WHERE id = ?").get(id);
  res.json({ instrument: toPublicInstrument(row) });
});

app.delete("/api/instruments/:id", (req, res) => {
  const { id } = req.params;

  const current = db.prepare("SELECT * FROM instruments WHERE id = ?").get(id);
  if (!current) {
    return res.status(404).json({ error: "Instrumento no encontrado." });
  }

  const inUse = db.prepare("SELECT COUNT(*) AS count FROM users WHERE instrumentId = ?").get(id).count;
  if (inUse > 0) {
    return res.status(400).json({
      error: `No se puede eliminar: hay ${inUse} estudiante(s) con este instrumento asignado.`,
    });
  }

  db.prepare("DELETE FROM instruments WHERE id = ?").run(id);
  res.json({ ok: true });
});

// ---------- SCORES (partituras) ----------

const toPublicScore = (row) => ({
  id: row.id,
  title: row.title,
  instrumentId: row.instrumentId,
  instrumentName: row.instrumentName,
  instrumentCode: row.instrumentCode,
  originalFileName: row.originalFileName,
  createdAt: row.createdAt,
});

const SCORE_SELECT = `
  SELECT scores.*, instruments.name AS instrumentName, instruments.code AS instrumentCode
  FROM scores
  LEFT JOIN instruments ON scores.instrumentId = instruments.id
`;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const id = `score-${Date.now()}`;
      const ext = path.extname(file.originalname) || ".pdf";
      cb(null, `${id}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" || path.extname(file.originalname).toLowerCase() === ".pdf";
    cb(isPdf ? null : new Error("Solo se permiten archivos PDF."), isPdf);
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

app.get("/api/scores", (req, res) => {
  const { instrumentId } = req.query;

  const rows = instrumentId
    ? db.prepare(`${SCORE_SELECT} WHERE scores.instrumentId = ? ORDER BY scores.createdAt DESC`).all(instrumentId)
    : db.prepare(`${SCORE_SELECT} ORDER BY scores.createdAt DESC`).all();

  res.json({ scores: rows.map(toPublicScore) });
});

app.post("/api/scores", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? "No se pudo subir el archivo." });
    }

    const { title, instrumentId } = req.body ?? {};
    const trimmedTitle = title?.trim();

    if (!trimmedTitle || !instrumentId || !req.file) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Título, instrumento y archivo PDF son obligatorios." });
    }

    const instrument = db.prepare("SELECT id FROM instruments WHERE id = ?").get(instrumentId);
    if (!instrument) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "El instrumento seleccionado no existe." });
    }

    const id = path.parse(req.file.filename).name;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO scores (id, title, instrumentId, fileName, originalFileName, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, trimmedTitle, instrumentId, req.file.filename, req.file.originalname, createdAt);

    const row = db.prepare(`${SCORE_SELECT} WHERE scores.id = ?`).get(id);
    res.status(201).json({ score: toPublicScore(row) });
  });
});

app.get("/api/scores/:id/download", (req, res) => {
  const { id } = req.params;
  const row = db.prepare("SELECT * FROM scores WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "Partitura no encontrada." });
  }

  const filePath = path.join(uploadsDir, row.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "El archivo de la partitura no se encuentra en el servidor." });
  }

  res.download(filePath, row.originalFileName);
});

app.delete("/api/scores/:id", (req, res) => {
  const { id } = req.params;
  const row = db.prepare("SELECT * FROM scores WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "Partitura no encontrada." });
  }

  db.prepare("DELETE FROM scores WHERE id = ?").run(id);

  const filePath = path.join(uploadsDir, row.fileName);
  fs.unlink(filePath, () => {});

  res.json({ ok: true });
});

// Cuántas partituras nuevas (del instrumento del estudiante) no ha visto
// todavía, para la campanita de notificaciones.
app.get("/api/scores/unseen-count/:userId", (req, res) => {
  const { userId } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  if (!user.instrumentId) {
    return res.json({ count: 0 });
  }

  const since = user.lastSeenScoresAt ?? "1970-01-01T00:00:00.000Z";
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM scores WHERE instrumentId = ? AND createdAt > ?")
    .get(user.instrumentId, since);

  res.json({ count });
});

app.post("/api/scores/mark-seen", (req, res) => {
  const { userId } = req.body ?? {};
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  db.prepare("UPDATE users SET lastSeenScoresAt = ? WHERE id = ?").run(new Date().toISOString(), userId);
  res.json({ ok: true });
});

// ---------- MEDIA (audio/video por enlace: YouTube o Drive) ----------

const toPublicMedia = (row) => ({
  id: row.id,
  title: row.title,
  instrumentId: row.instrumentId,
  instrumentName: row.instrumentName,
  instrumentCode: row.instrumentCode,
  mediaType: row.mediaType,
  url: row.url,
  createdAt: row.createdAt,
});

const MEDIA_SELECT = `
  SELECT media.*, instruments.name AS instrumentName, instruments.code AS instrumentCode
  FROM media
  LEFT JOIN instruments ON media.instrumentId = instruments.id
`;

const isLikelyUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

app.get("/api/media", (req, res) => {
  const { instrumentId } = req.query;

  const rows = instrumentId
    ? db.prepare(`${MEDIA_SELECT} WHERE media.instrumentId = ? ORDER BY media.createdAt DESC`).all(instrumentId)
    : db.prepare(`${MEDIA_SELECT} ORDER BY media.createdAt DESC`).all();

  res.json({ media: rows.map(toPublicMedia) });
});

app.post("/api/media", (req, res) => {
  const { title, instrumentId, mediaType, url } = req.body ?? {};
  const trimmedTitle = title?.trim();
  const trimmedUrl = url?.trim();

  if (!trimmedTitle || !instrumentId || !mediaType || !trimmedUrl) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  if (mediaType !== "AUDIO" && mediaType !== "VIDEO") {
    return res.status(400).json({ error: "El tipo debe ser AUDIO o VIDEO." });
  }

  if (!isLikelyUrl(trimmedUrl)) {
    return res.status(400).json({ error: "El enlace no parece una URL válida (debe empezar con http:// o https://)." });
  }

  const instrument = db.prepare("SELECT id FROM instruments WHERE id = ?").get(instrumentId);
  if (!instrument) {
    return res.status(400).json({ error: "El instrumento seleccionado no existe." });
  }

  const id = `media-${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO media (id, title, instrumentId, mediaType, url, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, trimmedTitle, instrumentId, mediaType, trimmedUrl, createdAt);

  const row = db.prepare(`${MEDIA_SELECT} WHERE media.id = ?`).get(id);
  res.status(201).json({ media: toPublicMedia(row) });
});

app.delete("/api/media/:id", (req, res) => {
  const { id } = req.params;
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "Elemento multimedia no encontrado." });
  }

  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.get("/api/media/unseen-count/:userId", (req, res) => {
  const { userId } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  if (!user.instrumentId) {
    return res.json({ count: 0 });
  }

  const since = user.lastSeenMediaAt ?? "1970-01-01T00:00:00.000Z";
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM media WHERE instrumentId = ? AND createdAt > ?")
    .get(user.instrumentId, since);

  res.json({ count });
});

app.post("/api/media/mark-seen", (req, res) => {
  const { userId } = req.body ?? {};
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  db.prepare("UPDATE users SET lastSeenMediaAt = ? WHERE id = ?").run(new Date().toISOString(), userId);
  res.json({ ok: true });
});

// ---------- POSTS (noticias) ----------
// Noticias que publica el administrador: título, texto (puede traer
// imágenes subidas y videos incrustados de YouTube/Drive como HTML) y
// fecha. Son públicas: se muestran en la página principal a cualquiera,
// esté o no logueado.

const toPublicPost = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.createdAt,
});

// Saneamiento básico del HTML que llega del editor: quita <script>,
// atributos de eventos (onclick, onerror, etc.) y enlaces "javascript:".
// No sustituye a un sanitizador completo, pero es suficiente aquí porque
// solo el administrador (un único usuario de confianza) puede publicar.
const sanitizeHtml = (html) =>
  String(html)
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');

const postImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, postsUploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `post-image-${Date.now()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isImage = /^image\//.test(file.mimetype);
    cb(isImage ? null : new Error("Solo se permiten imágenes."), isImage);
  },
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

app.post("/api/posts/upload-image", (req, res) => {
  postImageUpload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? "No se pudo subir la imagen." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen." });
    }

    res.status(201).json({ url: `/uploads/posts/${req.file.filename}` });
  });
});

app.get("/api/posts", (_req, res) => {
  const rows = db.prepare("SELECT * FROM posts ORDER BY createdAt DESC").all();
  res.json({ posts: rows.map(toPublicPost) });
});

app.post("/api/posts", (req, res) => {
  const { title, content } = req.body ?? {};
  const trimmedTitle = title?.trim();
  // El contenido es HTML (puede traer solo imágenes/video sin texto suelto),
  // así que solo revisamos que no venga vacío del todo.
  const trimmedContent = content?.trim();

  if (!trimmedTitle || !trimmedContent) {
    return res.status(400).json({ error: "El título y el contenido son obligatorios." });
  }

  const id = `post-${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO posts (id, title, content, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(id, trimmedTitle, sanitizeHtml(trimmedContent), createdAt);

  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  res.status(201).json({ post: toPublicPost(row) });
});

app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "Noticia no encontrada." });
  }

  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  res.json({ ok: true });
});

// ---------- STATS (estadísticas públicas para la página principal) ----------
// Números reales para mostrar en el Home en vez de datos de ejemplo fijos.
// Son públicos (sin login) porque el Home se ve sin necesidad de ingresar.

app.get("/api/stats", (_req, res) => {
  const { count: instrumentsCount } = db.prepare("SELECT COUNT(*) AS count FROM instruments").get();
  const { count: studentsCount } = db
    .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'USUARIO' AND isActive = 1")
    .get();
  const { count: scoresCount } = db.prepare("SELECT COUNT(*) AS count FROM scores").get();

  res.json({
    instruments: instrumentsCount,
    students: studentsCount,
    scores: scoresCount,
  });
});

// ---------- ATTENDANCE (asistencia) ----------

app.get("/api/attendance", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Falta el parámetro date." });
  }

  res.json({ attendance: buildAttendanceForDate(String(date)) });
});

app.post("/api/attendance/daily-list", (req, res) => {
  const { date } = req.body ?? {};

  if (!date) {
    return res.status(400).json({ error: "Falta la fecha." });
  }

  const members = getMemberRows();
  const existing = db.prepare("SELECT userId FROM attendance WHERE date = ?").all(date);
  const existingIds = new Set(existing.map((item) => item.userId));

  const insert = db.prepare(
    "INSERT INTO attendance (date, userId, status) VALUES (?, ?, 'PENDIENTE')",
  );

  const insertMissing = db.transaction(() => {
    for (const member of members) {
      if (!existingIds.has(member.id)) {
        insert.run(date, member.id);
      }
    }
  });

  insertMissing();

  res.json({ attendance: buildAttendanceForDate(date) });
});

app.patch("/api/attendance", (req, res) => {
  const { date, userId, status } = req.body ?? {};

  if (!date || !userId || !status) {
    return res.status(400).json({ error: "Faltan datos (date, userId, status)." });
  }

  db.prepare(`
    INSERT INTO attendance (date, userId, status) VALUES (?, ?, ?)
    ON CONFLICT(date, userId) DO UPDATE SET status = excluded.status
  `).run(date, userId, status);

  res.json({ attendance: buildAttendanceForDate(date) });
});

app.get("/api/attendance/user/:userId", (req, res) => {
  const { userId } = req.params;

  const entries = db
    .prepare("SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC")
    .all(userId);

  res.json({
    attendance: entries.map((entry) => ({
      date: entry.date,
      userId: entry.userId,
      status: entry.status,
    })),
  });
});

// Cualquier ruta que no sea /api/... y no sea un archivo estático real
// (por ejemplo /login o /admin/estudiantes al recargar la página) debe
// devolver index.html para que React Router la maneje en el navegador.
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API de Banda escuchando en http://localhost:${PORT}`);
});
