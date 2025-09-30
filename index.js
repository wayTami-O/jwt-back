import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// ⚡ Временное хранилище пользователей и refresh токенов
let users = [
  { id: 1, username: "admin", password: "1234", phone: "+1000000000" },
  { id: 2, username: "user", password: "pass", phone: "+2000000000" }
];

let refreshTokens = [];

// 🔑 Генерация Access токена (короткоживущий)
function generateAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "15m"
  });
}

// 🔑 Генерация Refresh токена (долгоживущий)
function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokens.push(token);
  return token;
}

// 🟢 Регистрация
app.post("/api/register", (req, res) => {
  const { username, password, phone } = req.body;

  if (!username || !password || !phone) {
    return res.status(400).json({ message: "Введите логин, пароль и телефон" });
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Пользователь уже существует" });
  }

  const newUser = { id: users.length + 1, username, password, phone };
  users.push(newUser);

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  res.status(201).json({
    message: "Регистрация успешна",
    accessToken,
    refreshToken,
    user: { id: newUser.id, username, phone: newUser.phone }
  });
});

// 🟢 Логин (требует логин, пароль и телефон)
app.post("/api/login", (req, res) => {
  const { username, password, phone } = req.body;

  if (!username || !password || !phone) {
    return res.status(400).json({ message: "Введите логин, пароль и телефон" });
  }

  const user = users.find(
    (u) =>
      u.username === username &&
      u.password === password &&
      u.phone === phone
  );

  if (!user) {
    return res.status(401).json({ message: "Неверные данные для входа" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, phone: user.phone }
  });
});

// 🛡 Middleware для проверки Access токена
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

// 🔄 Обновление токенов
app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    // Удаляем старый refresh token
    refreshTokens = refreshTokens.filter((t) => t !== token);

    // Генерируем новые
    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id, username: user.username });

    res.json({ accessToken, refreshToken });
  });
});

// 🚪 Logout
app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(400);

  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Вы вышли из системы" });
});

// 🔒 Приватный маршрут
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Добро пожаловать в защищённый эндпоинт!",
    user: req.user
  });
});

// 👥 Получить всех пользователей (без паролей)
app.get("/api/users", (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

// 🌍 Для проверки
app.get("/", (req, res) => {
  res.send("Backend работает 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Экспорт для Vercel
export default app;
