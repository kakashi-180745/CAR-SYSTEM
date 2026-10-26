import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

const require = createRequire(import.meta.url);

const rawJwtSecret = process.env.JWT_SECRET || "car-system-vercel-jwt-secret-key-2026-secure-hmac256";
const JWT_SECRET =
  Buffer.byteLength(rawJwtSecret, "utf8") >= 32
    ? rawJwtSecret
    : crypto.createHash("sha256").update(rawJwtSecret).digest();
const JWT_EXP_MS = Number(process.env.JWT_EXPIRATION_MS || 86400000);
const ADMIN_SIGNUP_CODE = (process.env.ADMIN_SIGNUP_CODE || "CAR-ADMIN-2026").trim();

const STATE_PATH = path.join(os.tmpdir(), "car_system_vercel_state_v1.json");

let cachedSeed = null;
function getSeed() {
  if (!cachedSeed) {
    cachedSeed = require("./_seed.json");
  }
  return cachedSeed;
}

let memoryState = null;

function createInitialState() {
  const seed = getSeed();
  const now = new Date().toISOString();
  const adminEmail = (process.env.APP_ADMIN_EMAIL || "admin@carsystem.com").trim().toLowerCase();
  const adminPassword = process.env.APP_ADMIN_PASSWORD || "Admin@1234";
  const adminName = (process.env.APP_ADMIN_NAME || "System Admin").trim();

  const users = [
    {
      id: 1,
      name: adminName,
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: "ADMIN",
      phone: "+91 98765 43210",
      city: "Coimbatore",
      country: "India",
      address: "CAR SYSTEM Headquarters, Avinashi Road",
      profileImage: null,
      createdAt: now
    },
    {
      id: 2,
      name: "Aarav Sharma",
      email: "demo@carsystem.com",
      passwordHash: bcrypt.hashSync("User@1234", 10),
      role: "USER",
      phone: "+91 98400 11223",
      city: "Bengaluru",
      country: "India",
      address: "Indiranagar 100 Feet Road",
      profileImage: null,
      createdAt: now
    }
  ];

  const cars = seed.cars.map((c) => ({ ...c }));
  const showrooms = seed.showrooms.map((s) => ({ ...s }));
  const firstCarId = cars[0]?.id || null;

  return {
    nextIds: {
      users: 3,
      cars: (cars[cars.length - 1]?.id || 1200) + 1,
      showrooms: (showrooms[showrooms.length - 1]?.id || 67) + 1,
      wishlist: 1,
      cart: 1,
      enquiries: 2,
      reports: 2
    },
    users,
    cars,
    showrooms,
    wishlist: [],
    cart: [],
    enquiries: [
      {
        id: 1,
        userId: 2,
        carId: firstCarId,
        name: "Aarav Sharma",
        email: "demo@carsystem.com",
        phone: "+91 98400 11223",
        city: "Bengaluru",
        subject: "Test Drive & On-Road Price Quote",
        message: "Hello team, I would like to schedule a weekend showroom visit and review financing options.",
        status: "OPEN",
        adminReply: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    reports: [
      {
        id: 1,
        userId: 2,
        carId: firstCarId,
        title: "Verify regional currency conversion display",
        category: "PRICING",
        description: "Please confirm whether the listed market price includes regional registration charges.",
        status: "OPEN",
        adminNotes: null,
        createdAt: now,
        updatedAt: now
      }
    ]
  };
}

function loadState() {
  if (memoryState) return memoryState;
  try {
    if (fs.existsSync(STATE_PATH)) {
      memoryState = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
      return memoryState;
    }
  } catch {
    // Re-initialize cleanly if /tmp snapshot is corrupted
  }
  memoryState = createInitialState();
  saveState();
  return memoryState;
}

function saveState() {
  if (!memoryState) return;
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(memoryState));
  } catch {
    // Keep serving from memoryState if /tmp write fails
  }
}

function toUserSummary(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone ?? null,
    city: u.city ?? null,
    country: u.country ?? null,
    address: u.address ?? null,
    profileImage: u.profileImage ?? null,
    createdAt: u.createdAt
  };
}

function signToken(user) {
  return jwt.sign(
    {
      uid: user.id,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    {
      subject: user.email,
      expiresIn: Math.floor(JWT_EXP_MS / 1000)
    }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const state = loadState();
    const email = String(payload.sub || "").toLowerCase();
    let user = state.users.find((u) => u.email === email);
    if (!user && email) {
      // Serverless cold-instance resilience: materialize verified signed JWT user
      user = {
        id: payload.uid || state.nextIds.users++,
        name: payload.name || email.split("@")[0],
        email,
        passwordHash: bcrypt.hashSync(crypto.randomUUID(), 8),
        role: payload.role === "ADMIN" ? "ADMIN" : "USER",
        phone: null,
        city: null,
        country: null,
        address: null,
        profileImage: null,
        createdAt: new Date().toISOString()
      };
      state.users.push(user);
      saveState();
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7).trim(), JWT_SECRET);
      const state = loadState();
      const email = String(payload.sub || "").toLowerCase();
      req.user = state.users.find((u) => u.email === email) || null;
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Administrator privileges required" });
  }
  next();
}

function detectImageMime(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "image/bmp";
  return null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api/") && req.url !== "/api") {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  next();
});

// Health
app.get("/api/health", (_req, res) => {
  const state = loadState();
  res.json({
    status: "UP",
    runtime: "vercel-serverless-node",
    cars: state.cars.length,
    showrooms: state.showrooms.length,
    timestamp: new Date().toISOString()
  });
});

// Auth
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, phone, city, country } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  const state = loadState();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (state.users.some((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ message: "Email is already registered" });
  }
  const user = {
    id: state.nextIds.users++,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: "USER",
    phone: phone?.trim() || null,
    city: city?.trim() || null,
    country: country?.trim() || null,
    address: null,
    profileImage: null,
    createdAt: new Date().toISOString()
  };
  state.users.push(user);
  saveState();
  res.json({ token: signToken(user), user: toUserSummary(user) });
});

app.post("/api/auth/admin-signup", (req, res) => {
  const { name, email, password, adminCode, phone, city, country } = req.body || {};
  if (!ADMIN_SIGNUP_CODE) {
    return res.status(403).json({ message: "Admin signup is disabled. Configure ADMIN_SIGNUP_CODE on the server." });
  }
  if (!adminCode || String(adminCode).trim() !== ADMIN_SIGNUP_CODE) {
    return res.status(403).json({ message: "Invalid admin signup code" });
  }
  if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  const state = loadState();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (state.users.some((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ message: "Email is already registered" });
  }
  const user = {
    id: state.nextIds.users++,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: "ADMIN",
    phone: phone?.trim() || null,
    city: city?.trim() || null,
    country: country?.trim() || null,
    address: null,
    profileImage: null,
    createdAt: new Date().toISOString()
  };
  state.users.push(user);
  saveState();
  res.json({ token: signToken(user), user: toUserSummary(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  const state = loadState();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = state.users.find((u) => u.email === normalizedEmail);
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: toUserSummary(user) });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json(toUserSummary(req.user));
});

// Profile
app.get("/api/profile", authenticate, (req, res) => {
  res.json(toUserSummary(req.user));
});

app.put("/api/profile", authenticate, (req, res) => {
  const { name, phone, city, country, address, password } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ message: "Name is required" });
  if (password !== undefined && password !== null && String(password).trim() !== "") {
    if (String(password).trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    req.user.passwordHash = bcrypt.hashSync(String(password).trim(), 10);
  }
  req.user.name = String(name).trim();
  req.user.phone = phone?.trim() || null;
  req.user.city = city?.trim() || null;
  req.user.country = country?.trim() || null;
  req.user.address = address?.trim() || null;
  saveState();
  res.json(toUserSummary(req.user));
});

app.post("/api/profile/image", authenticate, upload.single("file"), (req, res) => {
  if (!req.file || !req.file.buffer?.length) {
    return res.status(400).json({ message: "Please choose an image file" });
  }
  const mime = detectImageMime(req.file.buffer);
  if (!mime) {
    return res.status(400).json({ message: "Unsupported or invalid image file" });
  }
  req.user.profileImage = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
  saveState();
  res.json(toUserSummary(req.user));
});

// Cars
app.get("/api/cars", (req, res) => {
  const { q, brand, fuelType, transmission, bodyType, marketCountry, minPrice, maxPrice } = req.query;
  const state = loadState();
  let items = state.cars;

  if (q && String(q).trim()) {
    const term = String(q).trim().toLowerCase();
    items = items.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.brand?.toLowerCase().includes(term) ||
        c.model?.toLowerCase().includes(term) ||
        c.bodyType?.toLowerCase().includes(term) ||
        c.marketCountry?.toLowerCase().includes(term)
    );
  }
  if (brand && String(brand).trim()) {
    const b = String(brand).trim().toLowerCase();
    items = items.filter((c) => c.brand?.toLowerCase() === b);
  }
  if (fuelType && String(fuelType).trim()) {
    const f = String(fuelType).trim().toLowerCase();
    items = items.filter((c) => c.fuelType?.toLowerCase() === f);
  }
  if (transmission && String(transmission).trim()) {
    const t = String(transmission).trim().toLowerCase();
    items = items.filter((c) => c.transmission?.toLowerCase() === t);
  }
  if (bodyType && String(bodyType).trim()) {
    const bt = String(bodyType).trim().toLowerCase();
    items = items.filter((c) => c.bodyType?.toLowerCase() === bt);
  }
  if (marketCountry && String(marketCountry).trim()) {
    const mc = String(marketCountry).trim().toLowerCase();
    items = items.filter((c) => c.marketCountry?.toLowerCase() === mc);
  }
  if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(Number(minPrice))) {
    const min = Number(minPrice);
    items = items.filter((c) => Number(c.price) >= min);
  }
  if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
    const max = Number(maxPrice);
    items = items.filter((c) => Number(c.price) <= max);
  }

  res.json([...items].sort((a, b) => b.id - a.id));
});

app.get("/api/cars/:id", (req, res) => {
  const state = loadState();
  const car = state.cars.find((c) => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

app.post("/api/cars", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.brand || !b.model || b.price === undefined || !b.year || !b.fuelType || !b.transmission) {
    return res.status(400).json({ message: "Name, brand, model, price, year, fuelType, and transmission are required" });
  }
  const state = loadState();
  const car = {
    id: state.nextIds.cars++,
    name: String(b.name).trim(),
    brand: String(b.brand).trim(),
    model: String(b.model).trim(),
    price: Number(b.price),
    year: Number(b.year),
    fuelType: String(b.fuelType).trim(),
    transmission: String(b.transmission).trim(),
    bodyType: b.bodyType?.trim() || null,
    mileage: b.mileage?.trim() || null,
    description: b.description?.trim() || null,
    imageUrl: b.imageUrl?.trim() || null,
    marketCountry: b.marketCountry?.trim() || "India",
    currency: b.currency?.trim() || "INR",
    marketPrice: b.marketPrice !== undefined && b.marketPrice !== null && b.marketPrice !== "" ? Number(b.marketPrice) : Number(b.price),
    available: b.available === undefined ? true : Boolean(b.available),
    createdAt: new Date().toISOString()
  };
  state.cars.push(car);
  saveState();
  res.json(car);
});

app.put("/api/cars/:id", authenticate, requireAdmin, (req, res) => {
  const state = loadState();
  const car = state.cars.find((c) => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ message: "Car not found" });
  const b = req.body || {};
  Object.assign(car, {
    name: String(b.name ?? car.name).trim(),
    brand: String(b.brand ?? car.brand).trim(),
    model: String(b.model ?? car.model).trim(),
    price: Number(b.price ?? car.price),
    year: Number(b.year ?? car.year),
    fuelType: String(b.fuelType ?? car.fuelType).trim(),
    transmission: String(b.transmission ?? car.transmission).trim(),
    bodyType: b.bodyType !== undefined ? b.bodyType?.trim() || null : car.bodyType,
    mileage: b.mileage !== undefined ? b.mileage?.trim() || null : car.mileage,
    description: b.description !== undefined ? b.description?.trim() || null : car.description,
    imageUrl: b.imageUrl !== undefined ? b.imageUrl?.trim() || null : car.imageUrl,
    marketCountry: b.marketCountry !== undefined ? b.marketCountry?.trim() || null : car.marketCountry,
    currency: b.currency !== undefined ? b.currency?.trim() || null : car.currency,
    marketPrice:
      b.marketPrice !== undefined && b.marketPrice !== null && b.marketPrice !== ""
        ? Number(b.marketPrice)
        : car.marketPrice,
    available: b.available === undefined ? car.available : Boolean(b.available)
  });
  saveState();
  res.json(car);
});

app.delete("/api/cars/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const state = loadState();
  const idx = state.cars.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: "Car not found" });
  state.cars.splice(idx, 1);
  state.wishlist = state.wishlist.filter((w) => w.carId !== id);
  state.cart = state.cart.filter((c) => c.carId !== id);
  state.enquiries.forEach((e) => {
    if (e.carId === id) e.carId = null;
  });
  state.reports.forEach((r) => {
    if (r.carId === id) r.carId = null;
  });
  saveState();
  res.status(204).end();
});

// Showrooms
app.get("/api/showrooms", (req, res) => {
  const { q, city, brand, country } = req.query;
  const state = loadState();
  let items = state.showrooms;

  if (q && String(q).trim()) {
    const term = String(q).trim().toLowerCase();
    items = items.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.city?.toLowerCase().includes(term) ||
        s.brand?.toLowerCase().includes(term) ||
        s.country?.toLowerCase().includes(term) ||
        s.address?.toLowerCase().includes(term)
    );
  }
  if (city && String(city).trim()) {
    const c = String(city).trim().toLowerCase();
    items = items.filter((s) => s.city?.toLowerCase() === c);
  }
  if (brand && String(brand).trim()) {
    const b = String(brand).trim().toLowerCase();
    items = items.filter((s) => s.brand?.toLowerCase() === b);
  }
  if (country && String(country).trim()) {
    const co = String(country).trim().toLowerCase();
    items = items.filter((s) => s.country?.toLowerCase() === co);
  }

  res.json([...items].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)));
});

app.get("/api/showrooms/:id", (req, res) => {
  const state = loadState();
  const s = state.showrooms.find((item) => item.id === Number(req.params.id));
  if (!s) return res.status(404).json({ message: "Showroom not found" });
  res.json(s);
});

app.post("/api/showrooms", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.city || !b.address || b.latitude === undefined || b.longitude === undefined) {
    return res.status(400).json({ message: "Name, city, address, latitude, and longitude are required" });
  }
  const state = loadState();
  const showroom = {
    id: state.nextIds.showrooms++,
    name: String(b.name).trim(),
    brand: b.brand?.trim() || null,
    city: String(b.city).trim(),
    state: b.state?.trim() || null,
    country: b.country?.trim() || "India",
    address: String(b.address).trim(),
    phone: b.phone?.trim() || null,
    email: b.email?.trim() || null,
    website: b.website?.trim() || null,
    imageUrl: b.imageUrl?.trim() || null,
    latitude: Number(b.latitude),
    longitude: Number(b.longitude)
  };
  state.showrooms.push(showroom);
  saveState();
  res.json(showroom);
});

app.put("/api/showrooms/:id", authenticate, requireAdmin, (req, res) => {
  const state = loadState();
  const showroom = state.showrooms.find((s) => s.id === Number(req.params.id));
  if (!showroom) return res.status(404).json({ message: "Showroom not found" });
  const b = req.body || {};
  Object.assign(showroom, {
    name: String(b.name ?? showroom.name).trim(),
    brand: b.brand !== undefined ? b.brand?.trim() || null : showroom.brand,
    city: String(b.city ?? showroom.city).trim(),
    state: b.state !== undefined ? b.state?.trim() || null : showroom.state,
    country: b.country !== undefined ? b.country?.trim() || null : showroom.country,
    address: String(b.address ?? showroom.address).trim(),
    phone: b.phone !== undefined ? b.phone?.trim() || null : showroom.phone,
    email: b.email !== undefined ? b.email?.trim() || null : showroom.email,
    website: b.website !== undefined ? b.website?.trim() || null : showroom.website,
    imageUrl: b.imageUrl !== undefined ? b.imageUrl?.trim() || null : showroom.imageUrl,
    latitude: b.latitude !== undefined ? Number(b.latitude) : showroom.latitude,
    longitude: b.longitude !== undefined ? Number(b.longitude) : showroom.longitude
  });
  saveState();
  res.json(showroom);
});

app.delete("/api/showrooms/:id", authenticate, requireAdmin, (req, res) => {
  const state = loadState();
  const idx = state.showrooms.findIndex((s) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: "Showroom not found" });
  state.showrooms.splice(idx, 1);
  saveState();
  res.status(204).end();
});

// Wishlist
app.get("/api/wishlist", authenticate, (req, res) => {
  const state = loadState();
  const items = state.wishlist
    .filter((w) => w.userId === req.user.id)
    .sort((a, b) => b.id - a.id)
    .map((w) => {
      const car = state.cars.find((c) => c.id === w.carId);
      return car ? { id: w.id, createdAt: w.createdAt, car } : null;
    })
    .filter(Boolean);
  res.json(items);
});

app.post("/api/wishlist/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const state = loadState();
  const car = state.cars.find((c) => c.id === carId);
  if (!car) return res.status(404).json({ message: "Car not found" });
  let existing = state.wishlist.find((w) => w.userId === req.user.id && w.carId === carId);
  if (!existing) {
    existing = {
      id: state.nextIds.wishlist++,
      userId: req.user.id,
      carId,
      createdAt: new Date().toISOString()
    };
    state.wishlist.push(existing);
    saveState();
  }
  res.json({ id: existing.id, createdAt: existing.createdAt, car });
});

app.delete("/api/wishlist/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const state = loadState();
  state.wishlist = state.wishlist.filter((w) => !(w.userId === req.user.id && w.carId === carId));
  saveState();
  res.status(204).end();
});

// Cart
app.get("/api/cart", authenticate, (req, res) => {
  const state = loadState();
  const items = state.cart
    .filter((c) => c.userId === req.user.id)
    .sort((a, b) => b.id - a.id)
    .map((c) => {
      const car = state.cars.find((item) => item.id === c.carId);
      return car ? { id: c.id, quantity: c.quantity, createdAt: c.createdAt, car } : null;
    })
    .filter(Boolean);
  res.json(items);
});

app.post("/api/cart/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const state = loadState();
  const car = state.cars.find((c) => c.id === carId);
  if (!car) return res.status(404).json({ message: "Car not found" });
  let existing = state.cart.find((c) => c.userId === req.user.id && c.carId === carId);
  if (existing) {
    existing.quantity += 1;
  } else {
    existing = {
      id: state.nextIds.cart++,
      userId: req.user.id,
      carId,
      quantity: 1,
      createdAt: new Date().toISOString()
    };
    state.cart.push(existing);
  }
  saveState();
  res.json({ id: existing.id, quantity: existing.quantity, createdAt: existing.createdAt, car });
});

app.patch("/api/cart/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const qty = Number(req.body?.quantity);
  if (!Number.isFinite(qty)) return res.status(400).json({ message: "Quantity is required" });
  const state = loadState();
  const existing = state.cart.find((c) => c.userId === req.user.id && c.carId === carId);
  if (!existing) return res.status(404).json({ message: "Item not in cart" });
  if (qty <= 0) {
    state.cart = state.cart.filter((c) => !(c.userId === req.user.id && c.carId === carId));
    saveState();
    return res.status(204).end();
  }
  existing.quantity = Math.floor(qty);
  saveState();
  const car = state.cars.find((c) => c.id === carId);
  res.json({ id: existing.id, quantity: existing.quantity, createdAt: existing.createdAt, car });
});

app.delete("/api/cart/:carId", authenticate, (req, res) => {
  const carId = Number(req.params.carId);
  const state = loadState();
  state.cart = state.cart.filter((c) => !(c.userId === req.user.id && c.carId === carId));
  saveState();
  res.status(204).end();
});

app.delete("/api/cart", authenticate, (req, res) => {
  const state = loadState();
  state.cart = state.cart.filter((c) => c.userId !== req.user.id);
  saveState();
  res.status(204).end();
});

// Enquiries
function formatEnquiry(e, state) {
  const user = e.userId ? state.users.find((u) => u.id === e.userId) : null;
  const car = e.carId ? state.cars.find((c) => c.id === e.carId) : null;
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone ?? null,
    city: e.city ?? null,
    subject: e.subject ?? null,
    message: e.message,
    status: e.status,
    adminReply: e.adminReply ?? null,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    user: toUserSummary(user),
    car: car || null
  };
}

app.post("/api/enquiries", optionalAuthenticate, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.email || !b.message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }
  const state = loadState();
  const now = new Date().toISOString();
  const carId = b.carId ? Number(b.carId) : null;
  const validCar = carId ? state.cars.find((c) => c.id === carId) : null;
  const enquiry = {
    id: state.nextIds.enquiries++,
    userId: req.user?.id || null,
    carId: validCar ? validCar.id : null,
    name: String(b.name).trim(),
    email: String(b.email).trim(),
    phone: b.phone?.trim() || null,
    city: b.city?.trim() || null,
    subject: b.subject?.trim() || null,
    message: String(b.message).trim(),
    status: "OPEN",
    adminReply: null,
    createdAt: now,
    updatedAt: now
  };
  state.enquiries.push(enquiry);
  saveState();
  res.json(formatEnquiry(enquiry, state));
});

app.get("/api/enquiries/mine", authenticate, (req, res) => {
  const state = loadState();
  const items = state.enquiries
    .filter((e) => e.userId === req.user.id)
    .sort((a, b) => b.id - a.id)
    .map((e) => formatEnquiry(e, state));
  res.json(items);
});

app.get("/api/enquiries", authenticate, requireAdmin, (_req, res) => {
  const state = loadState();
  res.json([...state.enquiries].sort((a, b) => b.id - a.id).map((e) => formatEnquiry(e, state)));
});

app.put("/api/enquiries/:id", authenticate, requireAdmin, (req, res) => {
  const state = loadState();
  const enquiry = state.enquiries.find((e) => e.id === Number(req.params.id));
  if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
  const { status, adminReply } = req.body || {};
  if (status) enquiry.status = String(status).trim();
  if (adminReply !== undefined) enquiry.adminReply = adminReply === null ? null : String(adminReply).trim();
  enquiry.updatedAt = new Date().toISOString();
  saveState();
  res.json(formatEnquiry(enquiry, state));
});

// Reports
function formatReport(r, state) {
  const user = r.userId ? state.users.find((u) => u.id === r.userId) : null;
  const car = r.carId ? state.cars.find((c) => c.id === r.carId) : null;
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    status: r.status,
    adminNotes: r.adminNotes ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: toUserSummary(user),
    car: car || null
  };
}

app.post("/api/reports", authenticate, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.category || !b.description) {
    return res.status(400).json({ message: "Title, category, and description are required" });
  }
  const state = loadState();
  const now = new Date().toISOString();
  const carId = b.carId ? Number(b.carId) : null;
  const validCar = carId ? state.cars.find((c) => c.id === carId) : null;
  const report = {
    id: state.nextIds.reports++,
    userId: req.user.id,
    carId: validCar ? validCar.id : null,
    title: String(b.title).trim(),
    category: String(b.category).trim(),
    description: String(b.description).trim(),
    status: "OPEN",
    adminNotes: null,
    createdAt: now,
    updatedAt: now
  };
  state.reports.push(report);
  saveState();
  res.json(formatReport(report, state));
});

app.get("/api/reports/mine", authenticate, (req, res) => {
  const state = loadState();
  const items = state.reports
    .filter((r) => r.userId === req.user.id)
    .sort((a, b) => b.id - a.id)
    .map((r) => formatReport(r, state));
  res.json(items);
});

app.get("/api/reports", authenticate, requireAdmin, (_req, res) => {
  const state = loadState();
  res.json([...state.reports].sort((a, b) => b.id - a.id).map((r) => formatReport(r, state)));
});

app.put("/api/reports/:id", authenticate, requireAdmin, (req, res) => {
  const state = loadState();
  const report = state.reports.find((r) => r.id === Number(req.params.id));
  if (!report) return res.status(404).json({ message: "Report not found" });
  const { status, adminNotes } = req.body || {};
  if (status) report.status = String(status).trim();
  if (adminNotes !== undefined) report.adminNotes = adminNotes === null ? null : String(adminNotes).trim();
  report.updatedAt = new Date().toISOString();
  saveState();
  res.json(formatReport(report, state));
});

// Admin Users & Summary
app.get("/api/admin/users", authenticate, requireAdmin, (_req, res) => {
  const state = loadState();
  res.json([...state.users].sort((a, b) => b.id - a.id).map(toUserSummary));
});

app.patch("/api/admin/users/:id/role", authenticate, requireAdmin, (req, res) => {
  const role = String(req.body?.role || "").trim().toUpperCase();
  if (role !== "USER" && role !== "ADMIN") {
    return res.status(400).json({ message: "Role must be USER or ADMIN" });
  }
  const state = loadState();
  const target = state.users.find((u) => u.id === Number(req.params.id));
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.id === req.user.id && role !== "ADMIN") {
    return res.status(400).json({ message: "You cannot demote your own active admin account" });
  }
  target.role = role;
  saveState();
  res.json(toUserSummary(target));
});

app.delete("/api/admin/users/:id", authenticate, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own active admin account" });
  }
  const state = loadState();
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ message: "User not found" });
  state.users.splice(idx, 1);
  state.wishlist = state.wishlist.filter((w) => w.userId !== id);
  state.cart = state.cart.filter((c) => c.userId !== id);
  state.enquiries.forEach((e) => {
    if (e.userId === id) e.userId = null;
  });
  state.reports = state.reports.filter((r) => r.userId !== id);
  saveState();
  res.status(204).end();
});

app.get("/api/admin/summary", authenticate, requireAdmin, (_req, res) => {
  const state = loadState();
  res.json({
    users: state.users.length,
    admins: state.users.filter((u) => u.role === "ADMIN").length,
    cars: state.cars.length,
    showrooms: state.showrooms.length,
    enquiries: state.enquiries.length,
    openEnquiries: state.enquiries.filter((e) => e.status === "OPEN").length,
    reports: state.reports.length,
    openReports: state.reports.filter((r) => r.status === "OPEN").length
  });
});

app.use((err, _req, res, _next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Profile image must be 5MB or smaller" });
  }
  return res.status(500).json({ message: err?.message || "Unexpected server error" });
});

export default app;
