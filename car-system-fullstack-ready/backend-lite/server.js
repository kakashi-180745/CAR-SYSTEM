const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 8080);
const HOST = process.env.SERVER_ADDRESS || "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "car-system-dev-only-jwt-secret-change-in-production-2026-hmac256";
const JWT_EXPIRATION_SEC = Math.floor(Number(process.env.JWT_EXPIRATION_MS || 86400000) / 1000);
const ADMIN_SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE ?? "CAR-ADMIN-2026";
const BOOTSTRAP_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@carsystem.com";
const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "Admin@1234";
const BOOTSTRAP_ADMIN_NAME = process.env.BOOTSTRAP_ADMIN_NAME || "System Admin";
const BOOTSTRAP_DEMO_USER = process.env.BOOTSTRAP_DEMO_USER ?? "true";

const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.resolve(__dirname, process.env.UPLOAD_DIR || "../backend/uploads/profiles");
const SQL_SEED_PATH = path.resolve(__dirname, "../database/car_ecommerce_ready.sql");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "car_ecommerce.sqlite"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      phone TEXT,
      profile_image TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      price REAL NOT NULL,
      year INTEGER,
      fuel_type TEXT,
      transmission TEXT,
      body_type TEXT,
      mileage REAL,
      description TEXT,
      image_url TEXT,
      market_country TEXT,
      currency TEXT,
      market_price REAL,
      available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS showrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      city TEXT NOT NULL,
      state TEXT,
      country TEXT,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      image_url TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      car_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, car_id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      car_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, car_id)
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      car_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      car_id INTEGER,
      showroom_id INTEGER,
      issue_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      admin_response TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
    CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars(fuel_type);
    CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
    CREATE INDEX IF NOT EXISTS idx_showrooms_country ON showrooms(country);
  `);

  const now = new Date().toISOString();

  // Bootstrap admin user
  if (BOOTSTRAP_ADMIN_EMAIL && BOOTSTRAP_ADMIN_PASSWORD) {
    const existingAdmin = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(BOOTSTRAP_ADMIN_EMAIL.trim());
    if (!existingAdmin) {
      db.prepare(
        "INSERT INTO users (name, email, password, role, phone, created_at) VALUES (?, ?, ?, 'ADMIN', ?, ?)"
      ).run(
        BOOTSTRAP_ADMIN_NAME.trim(),
        BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase(),
        bcrypt.hashSync(BOOTSTRAP_ADMIN_PASSWORD, 10),
        "+1 800 555 2026",
        now
      );
    }
  }

  // Bootstrap demo customer account for quick verification
  if (BOOTSTRAP_DEMO_USER === "true") {
    let demoUser = db.prepare("SELECT * FROM users WHERE lower(email) = 'demo@carsystem.com'").get();
    if (!demoUser) {
      const info = db.prepare(
        "INSERT INTO users (name, email, password, role, phone, created_at) VALUES (?, ?, ?, 'USER', ?, ?)"
      ).run(
        "Arjun Mehta",
        "demo@carsystem.com",
        bcrypt.hashSync("User@1234", 10),
        "+91 9876543210",
        now
      );
      demoUser = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    }
  }

  // Seed cars and showrooms from database/car_ecommerce_ready.sql if empty
  const carCount = db.prepare("SELECT COUNT(*) as c FROM cars").get().c;
  const showroomCount = db.prepare("SELECT COUNT(*) as c FROM showrooms").get().c;

  if ((carCount === 0 || showroomCount === 0) && fs.existsSync(SQL_SEED_PATH)) {
    const sqlText = fs.readFileSync(SQL_SEED_PATH, "utf8");
    db.exec("BEGIN TRANSACTION");
    try {
      if (carCount === 0) {
        const carBlocks = extractAllSqlValuesBlocks(sqlText, "INSERT INTO cars");
        const insertCar = db.prepare(`
          INSERT INTO cars (
            name, brand, model, price, fuel_type, transmission, body_type,
            year, mileage, description, image_url, market_country, currency,
            market_price, available, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const carBlock of carBlocks) {
          const tuples = parseSqlTuples(carBlock);
          for (const t of tuples) {
            if (t.length >= 15) {
              insertCar.run(
                t[0], t[1], t[2], Number(t[3]), t[4], t[5], t[6],
                Number(t[7]), Number(t[8]), t[9], t[10], t[11], t[12],
                Number(t[13]), t[14] === "TRUE" || t[14] === true || t[14] === 1 ? 1 : 0,
                now
              );
            }
          }
        }
      }

      if (showroomCount === 0) {
        const showroomBlocks = extractAllSqlValuesBlocks(sqlText, "INSERT INTO showrooms");
        const insertShowroom = db.prepare(`
          INSERT INTO showrooms (name, address, city, country, latitude, longitude, phone, email)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const showroomBlock of showroomBlocks) {
          const tuples = parseSqlTuples(showroomBlock);
          for (const t of tuples) {
            if (t.length >= 8) {
              insertShowroom.run(t[0], t[1], t[2], t[3], Number(t[4]), Number(t[5]), t[6], t[7]);
            }
          }
        }
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      console.error("Failed seeding from SQL:", err);
    }
  }

  // Seed initial sample enquiry & report for demo user if tables are empty
  if (BOOTSTRAP_DEMO_USER === "true") {
    const demoUser = db.prepare("SELECT * FROM users WHERE lower(email) = 'demo@carsystem.com'").get();
    if (demoUser) {
      const enqCount = db.prepare("SELECT COUNT(*) as c FROM enquiries").get().c;
      if (enqCount === 0) {
        db.prepare(`
          INSERT INTO enquiries (user_id, car_id, name, email, phone, message, status, created_at)
          VALUES (?, 2, ?, ?, ?, '[Test Drive Request] Interested in scheduling a weekend test drive and finance quote.', 'CONTACTED', ?)
        `).run(demoUser.id, demoUser.name, demoUser.email, demoUser.phone, now);
      }
      const repCount = db.prepare("SELECT COUNT(*) as c FROM reports").get().c;
      if (repCount === 0) {
        db.prepare(`
          INSERT INTO reports (user_id, car_id, showroom_id, issue_type, subject, description, status, admin_response, created_at)
          VALUES (?, 1, 1, 'GENERAL', 'Brochure & color swatch availability', 'Can the Chennai showroom share official color options for 2026 sedans?', 'UNDER_REVIEW', 'Our Chennai product specialist is preparing the brochure link for you.', ?)
        `).run(demoUser.id, now);
      }
    }
  }
}

function extractAllSqlValuesBlocks(sqlText, prefix) {
  const blocks = [];
  let cursor = 0;
  while (cursor < sqlText.length) {
    const startIdx = sqlText.indexOf(prefix, cursor);
    if (startIdx === -1) break;
    const valuesIdx = sqlText.indexOf("VALUES", startIdx);
    if (valuesIdx === -1) break;
    let i = valuesIdx + "VALUES".length;
    let inSingleQuote = false;
    while (i < sqlText.length) {
      const ch = sqlText[i];
      if (inSingleQuote) {
        if (ch === "'" && sqlText[i + 1] === "'") {
          i += 2;
          continue;
        }
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === "'") inSingleQuote = false;
      } else {
        if (ch === "'") inSingleQuote = true;
        else if (ch === ";") {
          blocks.push(sqlText.slice(valuesIdx + "VALUES".length, i));
          break;
        }
      }
      i++;
    }
    cursor = i + 1;
  }
  return blocks;
}

function parseSqlTuples(valuesStr) {
  const rows = [];
  let i = 0;
  const n = valuesStr.length;
  while (i < n) {
    while (i < n && valuesStr[i] !== "(") i++;
    if (i >= n) break;
    i++; // skip '('
    const fields = [];
    while (i < n && valuesStr[i] !== ")") {
      while (i < n && /\s/.test(valuesStr[i])) i++;
      if (valuesStr[i] === "'") {
        i++;
        let val = "";
        while (i < n) {
          if (valuesStr[i] === "'" && valuesStr[i + 1] === "'") {
            val += "'";
            i += 2;
          } else if (valuesStr[i] === "\\") {
            val += valuesStr[i + 1] || "";
            i += 2;
          } else if (valuesStr[i] === "'") {
            i++;
            break;
          } else {
            val += valuesStr[i++];
          }
        }
        fields.push(val);
      } else {
        let raw = "";
        while (i < n && valuesStr[i] !== "," && valuesStr[i] !== ")") {
          raw += valuesStr[i++];
        }
        raw = raw.trim();
        fields.push(raw === "NULL" ? null : raw);
      }
      while (i < n && /\s/.test(valuesStr[i])) i++;
      if (valuesStr[i] === ",") i++;
    }
    if (valuesStr[i] === ")") i++;
    if (fields.length) rows.push(fields);
  }
  return rows;
}

// Mappers to camelCase JSON matching Spring Boot models
const mapUser = (r) => r && ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  phone: r.phone ?? null,
  profileImage: r.profile_image ?? null,
  createdAt: r.created_at
});

const mapCar = (r) => r && ({
  id: r.id,
  name: r.name,
  brand: r.brand,
  model: r.model,
  price: r.price,
  year: r.year,
  fuelType: r.fuel_type,
  transmission: r.transmission,
  bodyType: r.body_type,
  mileage: r.mileage,
  description: r.description,
  imageUrl: r.image_url,
  marketCountry: r.market_country,
  currency: r.currency,
  marketPrice: r.market_price,
  available: Boolean(r.available),
  createdAt: r.created_at
});

const mapShowroom = (r) => r && ({
  id: r.id,
  name: r.name,
  brand: r.brand ?? null,
  city: r.city,
  state: r.state ?? null,
  country: r.country ?? null,
  address: r.address,
  phone: r.phone ?? null,
  email: r.email ?? null,
  website: r.website ?? null,
  imageUrl: r.image_url ?? null,
  latitude: r.latitude,
  longitude: r.longitude
});

const mapCartItem = (r) => r && ({
  id: r.id,
  userId: r.user_id,
  carId: r.car_id,
  quantity: r.quantity
});

const mapWishlist = (r) => r && ({
  id: r.id,
  userId: r.user_id,
  carId: r.car_id,
  createdAt: r.created_at
});

const mapEnquiry = (r) => r && ({
  id: r.id,
  userId: r.user_id,
  carId: r.car_id,
  name: r.name,
  email: r.email,
  phone: r.phone ?? null,
  message: r.message ?? null,
  status: r.status,
  createdAt: r.created_at
});

const mapReport = (r) => r && ({
  id: r.id,
  userId: r.user_id,
  carId: r.car_id ?? null,
  showroomId: r.showroom_id ?? null,
  issueType: r.issue_type,
  subject: r.subject,
  description: r.description,
  imageUrl: r.image_url ?? null,
  status: r.status,
  adminResponse: r.admin_response ?? null,
  createdAt: r.created_at
});

initDatabase();

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["*"],
  exposedHeaders: ["Authorization"]
}));

app.use(express.json({ limit: "2mb" }));
app.use("/uploads/profiles", express.static(UPLOAD_DIR));

const apiError = (res, status, message) =>
  res.status(status).json({ message, timestamp: new Date().toISOString() });

// Rate limiter matching AuthRateLimiter.java (10 attempts per 15 min window per action+IP)
const rateBuckets = new Map();
function checkRateLimit(req, res, action) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= windowMs) {
    bucket = { startedAt: now, attempts: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.attempts += 1;
  if (bucket.attempts > 15) {
    apiError(res, 429, "Too many authentication attempts. Please try again later.");
    return false;
  }
  return true;
}

function generateToken(user) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: user.email,
    expiresIn: JWT_EXPIRATION_SEC
  });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return apiError(res, 401, "Authentication required.");
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(payload.sub);
    if (!user) {
      return apiError(res, 401, "Authentication required.");
    }
    req.user = user;
    next();
  } catch {
    return apiError(res, 401, "Invalid or expired token.");
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return apiError(res, 403, "You do not have permission to perform this action.");
  }
  next();
}

// ---------------- HEALTH ----------------
app.get("/api/health", (_req, res) => {
  res.json({ status: "UP", service: "car-ecommerce" });
});

// ---------------- AUTH ----------------
app.post("/api/auth/signup", (req, res) => {
  if (!checkRateLimit(req, res, "signup")) return;
  const { name, email, password, phone } = req.body || {};
  if (!name || String(name).trim().length < 2) return apiError(res, 400, "name: must be at least 2 characters");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) return apiError(res, 400, "email: must be a valid email address");
  if (!password || String(password).length < 8) return apiError(res, 400, "password: size must be between 8 and 72");
  if (!phone || !/^[0-9+()\- ]{7,20}$/.test(String(phone).trim())) return apiError(res, 400, "phone: Enter a valid phone number");

  const cleanEmail = String(email).trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE lower(email) = ?").get(cleanEmail)) {
    return apiError(res, 400, "An account already exists with this email.");
  }

  const now = new Date().toISOString();
  const info = db.prepare(
    "INSERT INTO users (name, email, password, role, phone, created_at) VALUES (?, ?, ?, 'USER', ?, ?)"
  ).run(String(name).trim(), cleanEmail, bcrypt.hashSync(String(password), 10), String(phone).trim(), now);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.json({
    token: generateToken(user),
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.post("/api/auth/admin-signup", (req, res) => {
  if (!checkRateLimit(req, res, "admin-signup")) return;
  const { name, email, password, signupCode } = req.body || {};
  if (!ADMIN_SIGNUP_CODE || !String(ADMIN_SIGNUP_CODE).trim()) {
    return apiError(res, 400, "Admin registration is disabled.");
  }
  if (!signupCode || String(signupCode) !== String(ADMIN_SIGNUP_CODE)) {
    return apiError(res, 400, "Invalid admin registration code.");
  }
  if (!name || String(name).trim().length < 2) return apiError(res, 400, "name: must be at least 2 characters");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) return apiError(res, 400, "email: must be a valid email address");
  if (!password || String(password).length < 8) return apiError(res, 400, "password: size must be between 8 and 72");

  const cleanEmail = String(email).trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE lower(email) = ?").get(cleanEmail)) {
    return apiError(res, 400, "An account already exists with this email.");
  }

  const now = new Date().toISOString();
  const info = db.prepare(
    "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'ADMIN', ?)"
  ).run(String(name).trim(), cleanEmail, bcrypt.hashSync(String(password), 10), now);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.json({
    token: generateToken(user),
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.post("/api/auth/login", (req, res) => {
  if (!checkRateLimit(req, res, "login")) return;
  const { email, password } = req.body || {};
  if (!email || !password) return apiError(res, 400, "Email and password are required.");

  const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(String(email).trim());
  if (!user || !bcrypt.compareSync(String(password), user.password)) {
    return apiError(res, 401, "Invalid email or password.");
  }

  res.json({
    token: generateToken(user),
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json(mapUser(req.user));
});

// ---------------- CARS ----------------
app.get("/api/cars", (req, res) => {
  const { q, brand, fuelType, transmission, bodyType, country, minPrice, maxPrice, available } = req.query;
  let rows = db.prepare("SELECT * FROM cars ORDER BY id ASC").all().map(mapCar);

  if (q && String(q).trim()) {
    const needle = String(q).trim().toLowerCase();
    rows = rows.filter((c) =>
      [c.name, c.brand, c.model, c.bodyType, c.fuelType, c.marketCountry]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  if (brand && String(brand).trim()) {
    const b = String(brand).trim().toLowerCase();
    rows = rows.filter((c) => (c.brand || "").toLowerCase() === b);
  }
  if (fuelType && String(fuelType).trim()) {
    const f = String(fuelType).trim().toLowerCase();
    rows = rows.filter((c) => (c.fuelType || "").toLowerCase() === f);
  }
  if (transmission && String(transmission).trim()) {
    const t = String(transmission).trim().toLowerCase();
    rows = rows.filter((c) => (c.transmission || "").toLowerCase() === t);
  }
  if (bodyType && String(bodyType).trim()) {
    const bt = String(bodyType).trim().toLowerCase();
    rows = rows.filter((c) => (c.bodyType || "").toLowerCase() === bt);
  }
  if (country && String(country).trim()) {
    const mc = String(country).trim().toLowerCase();
    rows = rows.filter((c) => (c.marketCountry || "").toLowerCase() === mc);
  }
  if (minPrice !== undefined && minPrice !== "") {
    const min = Number(minPrice);
    if (!Number.isNaN(min)) rows = rows.filter((c) => Number(c.price) >= min);
  }
  if (maxPrice !== undefined && maxPrice !== "") {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) rows = rows.filter((c) => Number(c.price) <= max);
  }
  if (available !== undefined && available !== "") {
    const want = String(available).toLowerCase() === "true";
    rows = rows.filter((c) => Boolean(c.available) === want);
  }

  res.json(rows);
});

app.get("/api/cars/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM cars WHERE id = ?").get(Number(req.params.id));
  if (!row) return apiError(res, 404, "Car not found.");
  res.json(mapCar(row));
});

app.post("/api/cars", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.brand || !String(b.brand).trim()) return apiError(res, 400, "Brand is required.");
  if (!b.model || !String(b.model).trim()) return apiError(res, 400, "Model is required.");
  if (b.price === undefined || b.price === null || Number(b.price) <= 0) return apiError(res, 400, "Price must be greater than zero.");

  const brand = String(b.brand).trim();
  const model = String(b.model).trim();
  const name = b.name && String(b.name).trim() ? String(b.name).trim() : `${brand} ${model}`;
  const now = new Date().toISOString();

  const info = db.prepare(`
    INSERT INTO cars (
      name, brand, model, price, year, fuel_type, transmission, body_type,
      mileage, description, image_url, market_country, currency, market_price,
      available, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    brand,
    model,
    Number(b.price),
    b.year ? Number(b.year) : 2026,
    b.fuelType || "Petrol",
    b.transmission || "Automatic",
    b.bodyType || "SUV",
    b.mileage !== undefined && b.mileage !== "" && b.mileage !== null ? Number(b.mileage) : null,
    b.description || "",
    b.imageUrl || "",
    b.marketCountry || "India",
    b.currency || "INR",
    b.marketPrice !== undefined && b.marketPrice !== "" && b.marketPrice !== null ? Number(b.marketPrice) : Number(b.price),
    b.available === false ? 0 : 1,
    now
  );

  res.json(mapCar(db.prepare("SELECT * FROM cars WHERE id = ?").get(info.lastInsertRowid)));
});

app.put("/api/cars/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM cars WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Car not found.");

  const b = req.body || {};
  if (!b.brand || !String(b.brand).trim()) return apiError(res, 400, "Brand is required.");
  if (!b.model || !String(b.model).trim()) return apiError(res, 400, "Model is required.");
  if (b.price === undefined || b.price === null || Number(b.price) <= 0) return apiError(res, 400, "Price must be greater than zero.");

  const brand = String(b.brand).trim();
  const model = String(b.model).trim();
  const name = b.name && String(b.name).trim() ? String(b.name).trim() : `${brand} ${model}`;

  db.prepare(`
    UPDATE cars SET
      name = ?, brand = ?, model = ?, price = ?, year = ?, fuel_type = ?,
      transmission = ?, body_type = ?, mileage = ?, description = ?, image_url = ?,
      market_country = ?, currency = ?, market_price = ?, available = ?
    WHERE id = ?
  `).run(
    name,
    brand,
    model,
    Number(b.price),
    b.year ? Number(b.year) : existing.year,
    b.fuelType ?? existing.fuel_type,
    b.transmission ?? existing.transmission,
    b.bodyType ?? existing.body_type,
    b.mileage !== undefined && b.mileage !== "" && b.mileage !== null ? Number(b.mileage) : null,
    b.description ?? existing.description,
    b.imageUrl ?? existing.image_url,
    b.marketCountry ?? existing.market_country,
    b.currency ?? existing.currency,
    b.marketPrice !== undefined && b.marketPrice !== "" && b.marketPrice !== null ? Number(b.marketPrice) : null,
    b.available === false ? 0 : 1,
    id
  );

  res.json(mapCar(db.prepare("SELECT * FROM cars WHERE id = ?").get(id)));
});

app.delete("/api/cars/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM cars WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Car not found.");
  db.prepare("DELETE FROM cart_items WHERE car_id = ?").run(id);
  db.prepare("DELETE FROM wishlist WHERE car_id = ?").run(id);
  db.prepare("DELETE FROM cars WHERE id = ?").run(id);
  res.status(204).end();
});

// ---------------- SHOWROOMS ----------------
app.get("/api/showrooms", (_req, res) => {
  const rows = db.prepare("SELECT * FROM showrooms ORDER BY id ASC").all().map(mapShowroom);
  res.json(rows);
});

app.get("/api/showrooms/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM showrooms WHERE id = ?").get(Number(req.params.id));
  if (!row) return apiError(res, 404, "Showroom not found.");
  res.json(mapShowroom(row));
});

app.post("/api/showrooms", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.name || !String(b.name).trim()) return apiError(res, 400, "Showroom name is required.");
  if (!b.city || !String(b.city).trim()) return apiError(res, 400, "City is required.");
  if (!b.address || !String(b.address).trim()) return apiError(res, 400, "Address is required.");
  const lat = Number(b.latitude);
  const lon = Number(b.longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) return apiError(res, 400, "Latitude must be between -90 and 90.");
  if (Number.isNaN(lon) || lon < -180 || lon > 180) return apiError(res, 400, "Longitude must be between -180 and 180.");

  const info = db.prepare(`
    INSERT INTO showrooms (name, brand, city, state, country, address, phone, email, website, image_url, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(b.name).trim(),
    b.brand || null,
    String(b.city).trim(),
    b.state || null,
    b.country || "India",
    String(b.address).trim(),
    b.phone || null,
    b.email || null,
    b.website || null,
    b.imageUrl || null,
    lat,
    lon
  );

  res.json(mapShowroom(db.prepare("SELECT * FROM showrooms WHERE id = ?").get(info.lastInsertRowid)));
});

app.put("/api/showrooms/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM showrooms WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Showroom not found.");

  const b = req.body || {};
  if (!b.name || !String(b.name).trim()) return apiError(res, 400, "Showroom name is required.");
  if (!b.city || !String(b.city).trim()) return apiError(res, 400, "City is required.");
  if (!b.address || !String(b.address).trim()) return apiError(res, 400, "Address is required.");
  const lat = Number(b.latitude);
  const lon = Number(b.longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) return apiError(res, 400, "Latitude must be between -90 and 90.");
  if (Number.isNaN(lon) || lon < -180 || lon > 180) return apiError(res, 400, "Longitude must be between -180 and 180.");

  db.prepare(`
    UPDATE showrooms SET
      name = ?, brand = ?, city = ?, state = ?, country = ?, address = ?,
      phone = ?, email = ?, website = ?, image_url = ?, latitude = ?, longitude = ?
    WHERE id = ?
  `).run(
    String(b.name).trim(),
    b.brand ?? existing.brand,
    String(b.city).trim(),
    b.state ?? existing.state,
    b.country ?? existing.country,
    String(b.address).trim(),
    b.phone ?? existing.phone,
    b.email ?? existing.email,
    b.website ?? existing.website,
    b.imageUrl ?? existing.image_url,
    lat,
    lon,
    id
  );

  res.json(mapShowroom(db.prepare("SELECT * FROM showrooms WHERE id = ?").get(id)));
});

app.delete("/api/showrooms/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM showrooms WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Showroom not found.");
  db.prepare("DELETE FROM showrooms WHERE id = ?").run(id);
  res.status(204).end();
});

// ---------------- WISHLIST ----------------
app.get("/api/wishlist", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM wishlist WHERE user_id = ? ORDER BY id DESC").all(req.user.id).map(mapWishlist);
  res.json(rows);
});

app.post("/api/wishlist/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const car = db.prepare("SELECT id FROM cars WHERE id = ?").get(carId);
  if (!car) return apiError(res, 404, "Car not found.");

  let item = db.prepare("SELECT * FROM wishlist WHERE user_id = ? AND car_id = ?").get(req.user.id, carId);
  if (!item) {
    const info = db.prepare("INSERT INTO wishlist (user_id, car_id, created_at) VALUES (?, ?, ?)").run(
      req.user.id,
      carId,
      new Date().toISOString()
    );
    item = db.prepare("SELECT * FROM wishlist WHERE id = ?").get(info.lastInsertRowid);
  }
  res.json(mapWishlist(item));
});

app.delete("/api/wishlist/:carId", authenticate, (req, res) => {
  db.prepare("DELETE FROM wishlist WHERE user_id = ? AND car_id = ?").run(req.user.id, Number(req.params.carId));
  res.status(204).end();
});

// ---------------- CART ----------------
app.get("/api/cart", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM cart_items WHERE user_id = ? ORDER BY id DESC").all(req.user.id).map(mapCartItem);
  res.json(rows);
});

app.post("/api/cart/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const car = db.prepare("SELECT * FROM cars WHERE id = ?").get(carId);
  if (!car) return apiError(res, 404, "Car not found.");
  if (!car.available) return apiError(res, 400, "This car is currently not available.");

  const delta = Math.max(1, Number(req.body?.quantity ?? 1) || 1);
  const existing = db.prepare("SELECT * FROM cart_items WHERE user_id = ? AND car_id = ?").get(req.user.id, carId);
  if (existing) {
    const nextQty = Math.min(20, existing.quantity + delta);
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(nextQty, existing.id);
    return res.json(mapCartItem(db.prepare("SELECT * FROM cart_items WHERE id = ?").get(existing.id)));
  }

  const info = db.prepare("INSERT INTO cart_items (user_id, car_id, quantity) VALUES (?, ?, ?)").run(
    req.user.id,
    carId,
    Math.min(20, delta)
  );
  res.json(mapCartItem(db.prepare("SELECT * FROM cart_items WHERE id = ?").get(info.lastInsertRowid)));
});

app.patch("/api/cart/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const qty = req.body?.quantity;
  if (qty === undefined || qty === null) return apiError(res, 400, "Quantity is required.");
  const existing = db.prepare("SELECT * FROM cart_items WHERE user_id = ? AND car_id = ?").get(req.user.id, carId);
  if (!existing) return apiError(res, 404, "Cart item not found.");
  if (Number(qty) <= 0) {
    db.prepare("DELETE FROM cart_items WHERE id = ?").run(existing.id);
    return res.status(204).end();
  }
  const clamped = Math.min(20, Number(qty));
  db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(clamped, existing.id);
  res.json(mapCartItem(db.prepare("SELECT * FROM cart_items WHERE id = ?").get(existing.id)));
});

app.delete("/api/cart/:carId", authenticate, (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ? AND car_id = ?").run(req.user.id, Number(req.params.carId));
  res.status(204).end();
});

app.delete("/api/cart", authenticate, (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);
  res.status(204).end();
});

// ---------------- ENQUIRIES ----------------
app.get("/api/enquiries/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM enquiries WHERE user_id = ? ORDER BY created_at DESC, id DESC").all(req.user.id).map(mapEnquiry);
  res.json(rows);
});

app.get("/api/enquiries", authenticate, requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC").all().map(mapEnquiry);
  res.json(rows);
});

app.post("/api/enquiries", authenticate, (req, res) => {
  const b = req.body || {};
  const carId = Number(b.carId);
  if (!carId) return apiError(res, 400, "Car ID is required.");
  const car = db.prepare("SELECT id FROM cars WHERE id = ?").get(carId);
  if (!car) return apiError(res, 404, "Car not found.");

  const name = b.name && String(b.name).trim() ? String(b.name).trim() : req.user.name;
  const phone = b.phone && String(b.phone).trim() ? String(b.phone).trim() : (req.user.phone || null);
  const message = b.message && String(b.message).trim()
    ? String(b.message).trim()
    : "I am interested in this car. Please contact me.";
  const now = new Date().toISOString();

  const info = db.prepare(`
    INSERT INTO enquiries (user_id, car_id, name, email, phone, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?)
  `).run(req.user.id, carId, name, req.user.email, phone, message, now);

  res.json(mapEnquiry(db.prepare("SELECT * FROM enquiries WHERE id = ?").get(info.lastInsertRowid)));
});

app.patch("/api/enquiries/:id/status", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || "").trim().toUpperCase();
  const allowed = new Set(["NEW", "CONTACTED", "TEST_DRIVE_SCHEDULED", "CLOSED"]);
  if (!allowed.has(status)) return apiError(res, 400, `Invalid enquiry status: ${status}`);

  const existing = db.prepare("SELECT id FROM enquiries WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Enquiry not found.");

  db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
  res.json(mapEnquiry(db.prepare("SELECT * FROM enquiries WHERE id = ?").get(id)));
});

// ---------------- REPORTS ----------------
app.get("/api/reports/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC, id DESC").all(req.user.id).map(mapReport);
  res.json(rows);
});

app.get("/api/reports", authenticate, requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM reports ORDER BY created_at DESC, id DESC").all().map(mapReport);
  res.json(rows);
});

app.post("/api/reports", authenticate, (req, res) => {
  const b = req.body || {};
  if (!b.subject || !String(b.subject).trim()) return apiError(res, 400, "Subject is required.");
  if (!b.description || !String(b.description).trim()) return apiError(res, 400, "Description is required.");

  const carId = b.carId ? Number(b.carId) : null;
  const showroomId = b.showroomId ? Number(b.showroomId) : null;
  if (carId && !db.prepare("SELECT id FROM cars WHERE id = ?").get(carId)) {
    return apiError(res, 404, "Car not found.");
  }
  if (showroomId && !db.prepare("SELECT id FROM showrooms WHERE id = ?").get(showroomId)) {
    return apiError(res, 404, "Showroom not found.");
  }

  const issueType = b.issueType && String(b.issueType).trim() ? String(b.issueType).trim().toUpperCase() : "GENERAL";
  const imageUrl = b.imageUrl && String(b.imageUrl).trim() ? String(b.imageUrl).trim() : null;
  const now = new Date().toISOString();

  const info = db.prepare(`
    INSERT INTO reports (user_id, car_id, showroom_id, issue_type, subject, description, image_url, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
  `).run(req.user.id, carId, showroomId, issueType, String(b.subject).trim(), String(b.description).trim(), imageUrl, now);

  res.json(mapReport(db.prepare("SELECT * FROM reports WHERE id = ?").get(info.lastInsertRowid)));
});

app.patch("/api/reports/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
  if (!existing) return apiError(res, 404, "Report not found.");

  const allowed = new Set(["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"]);
  let status = existing.status;
  if (req.body?.status && String(req.body.status).trim()) {
    status = String(req.body.status).trim().toUpperCase();
    if (!allowed.has(status)) return apiError(res, 400, `Invalid report status: ${status}`);
  }
  const adminResponse = req.body?.adminResponse !== undefined && req.body?.adminResponse !== null
    ? String(req.body.adminResponse).trim()
    : existing.admin_response;

  db.prepare("UPDATE reports SET status = ?, admin_response = ? WHERE id = ?").run(status, adminResponse, id);
  res.json(mapReport(db.prepare("SELECT * FROM reports WHERE id = ?").get(id)));
});

// ---------------- USERS & PROFILE ----------------
function applyUserUpdates(targetUser, input, res) {
  let name = targetUser.name;
  let phone = targetUser.phone;
  let profileImage = targetUser.profile_image;
  let passwordHash = targetUser.password;

  if (input.name !== undefined && input.name !== null) {
    name = String(input.name).trim();
    if (name.length < 2) {
      apiError(res, 400, "Name must be at least 2 characters.");
      return null;
    }
  }
  if (input.phone !== undefined && input.phone !== null) {
    phone = String(input.phone).trim();
    if (phone && !/^[0-9+()\- ]{7,20}$/.test(phone)) {
      apiError(res, 400, "Please enter a valid phone number.");
      return null;
    }
  }
  if (input.profileImage !== undefined) {
    const img = input.profileImage === null ? "" : String(input.profileImage).trim();
    if (!img) {
      profileImage = null;
    } else if (/^(https?:\/\/|\/uploads\/)/.test(img)) {
      profileImage = img;
    } else {
      apiError(res, 400, "Profile image URL must start with https://, http://, or /uploads/.");
      return null;
    }
  }
  if (input.password && String(input.password).trim()) {
    if (String(input.password).length < 8) {
      apiError(res, 400, "Password must contain at least 8 characters.");
      return null;
    }
    passwordHash = bcrypt.hashSync(String(input.password), 10);
  }

  db.prepare("UPDATE users SET name = ?, phone = ?, profile_image = ?, password = ? WHERE id = ?").run(
    name,
    phone,
    profileImage,
    passwordHash,
    targetUser.id
  );

  return mapUser(db.prepare("SELECT * FROM users WHERE id = ?").get(targetUser.id));
}

app.get("/api/users/me", authenticate, (req, res) => {
  res.json(mapUser(req.user));
});

app.put("/api/users/me", authenticate, (req, res) => {
  const updated = applyUserUpdates(req.user, req.body || {}, res);
  if (updated) res.json(updated);
});

app.get("/api/users", authenticate, requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM users ORDER BY id ASC").all().map(mapUser);
  res.json(rows);
});

app.get("/api/users/:id", authenticate, requireAdmin, (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.params.id));
  if (!u) return apiError(res, 404, "User not found.");
  res.json(mapUser(u));
});

app.put("/api/users/:id", authenticate, requireAdmin, (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.params.id));
  if (!u) return apiError(res, 404, "User not found.");
  const updated = applyUserUpdates(u, req.body || {}, res);
  if (updated) res.json(updated);
});

app.delete("/api/users/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!target) return apiError(res, 404, "User not found.");
  if (target.id === req.user.id) return apiError(res, 400, "You cannot delete your own account.");
  if (target.role === "ADMIN") return apiError(res, 400, "Administrator accounts cannot be deleted from here.");

  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM wishlist WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.status(204).end();
});

// Profile image upload with magic-byte validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function detectImageExtension(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "gif";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "webp";
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "bmp";
  return null;
}

app.post("/api/profile/image", authenticate, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return apiError(res, 413, "Profile image must be 5MB or smaller.");
      }
      return apiError(res, 400, err.message || "Could not upload image.");
    }
    if (!req.file || !req.file.buffer?.length) {
      return apiError(res, 400, "Please choose an image.");
    }
    const ext = detectImageExtension(req.file.buffer);
    if (!ext) {
      return apiError(res, 400, "The uploaded file is not a valid image (JPG, PNG, WebP, GIF, BMP).");
    }
    const filename = `${crypto.randomUUID()}.${ext}`;
    const target = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(target, req.file.buffer);

    const urlPath = `/uploads/profiles/${filename}`;
    db.prepare("UPDATE users SET profile_image = ? WHERE id = ?").run(urlPath, req.user.id);
    res.json(mapUser(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)));
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  apiError(res, 500, "Unexpected server error.");
});

app.listen(PORT, HOST, () => {
  const carCount = db.prepare("SELECT COUNT(*) as c FROM cars").get().c;
  const showroomCount = db.prepare("SELECT COUNT(*) as c FROM showrooms").get().c;
  console.log(`Car System API running at http://${HOST}:${PORT} (${carCount} cars, ${showroomCount} showrooms seeded)`);
});
