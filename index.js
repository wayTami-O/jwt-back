import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ⚡ Временное хранилище пользователей (в памяти)
let users = [
  { id: 1, username: "admin", password: "1234" },
  { id: 2, username: "user", password: "pass" }
];

// 🔑 Генерация токена
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h"
  });
}

// 🟢 Роут: регистрация
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Введите логин и пароль" });
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Пользователь уже существует" });
  }

  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  const token = generateToken(newUser);
  res.status(201).json({ message: "Регистрация успешна", token });
});

// 🟢 Роут: логин
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Неверный логин или пароль" });
  }

  const token = generateToken(user);
  res.json({ token });
});

// 🛡 Middleware для проверки токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 🔒 Приватный маршрут
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Добро пожаловать в защищённый эндпоинт!",
    user: req.user
  });
});

// 🌍 Для проверки (главная)
app.get("/", (req, res) => {
  res.send("Backend работает 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Экспорт для Vercel
export default app;
