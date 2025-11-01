import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

let users = [
  { id: 1, username: "admin", password: "1234", phone: "+1000000000" },
  { id: 2, username: "user", password: "pass", phone: "+2000000000" }
];

let refreshTokens = [];

// 📋 Статичные данные
let contacts = {
  phones: ["+7 (999) 123-45-67", "+7 (999) 765-43-21"],
  address: "г. Москва, ул. Примерная, д. 1, офис 100",
  email: "info@example.com",
  title: "Контакты"
};

let advantages = [
  {
    title: "Опыт работы",
    description: "Более 10 лет опыта в разработке качественных решений"
  },
  {
    title: "Команда профессионалов",
    description: "Наша команда состоит из опытных специалистов"
  },
  {
    title: "Индивидуальный подход",
    description: "Каждый проект разрабатывается с учетом ваших потребностей"
  }
];

let projects = [
  {
    photo: "https://example.com/project1.jpg",
    title: "Веб-приложение для бизнеса",
    description: "Разработка современного веб-приложения с использованием React и Node.js",
    workType: "Веб-разработка",
    client: "ООО 'Компания А'"
  },
  {
    photo: "https://example.com/project2.jpg",
    title: "Мобильное приложение",
    description: "Создание кроссплатформенного мобильного приложения на React Native",
    workType: "Мобильная разработка",
    client: "ООО 'Компания Б'"
  },
  {
    photo: "https://example.com/project3.jpg",
    title: "E-commerce платформа",
    description: "Разработка полнофункциональной платформы для онлайн-торговли",
    workType: "Веб-разработка",
    client: "ИП Иванов И.И."
  }
];

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "15m"
  });
}

function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokens.push(token);
  return token;
}

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

app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    refreshTokens = refreshTokens.filter((t) => t !== token);

    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id, username: user.username });

    res.json({ accessToken, refreshToken });
  });
});

app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(400);

  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Вы вышли из системы" });
});

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

// 📞 Получить контакты (требуется JWT)
app.get("/api/contacts", authenticateToken, (req, res) => {
  res.json(contacts);
});

// 📞 Добавить/обновить контакты (требуется JWT)
app.post("/api/contacts", authenticateToken, (req, res) => {
  const { phone, address, email, title } = req.body;

  if (phone) {
    if (!contacts.phones.includes(phone)) {
      contacts.phones.push(phone);
    }
  }

  if (address) contacts.address = address;
  if (email) contacts.email = email;
  if (title) contacts.title = title;

  res.status(201).json({
    message: "Контакты обновлены",
    contacts
  });
});

// ⭐ Получить преимущества (требуется JWT)
app.get("/api/advantages", authenticateToken, (req, res) => {
  res.json(advantages);
});

// ⭐ Добавить преимущество (требуется JWT)
app.post("/api/advantages", authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Введите title и description" });
  }

  const newAdvantage = { title, description };
  advantages.push(newAdvantage);

  res.status(201).json({
    message: "Преимущество добавлено",
    advantage: newAdvantage
  });
});

// 🚀 Получить проекты (требуется JWT)
app.get("/api/projects", authenticateToken, (req, res) => {
  res.json(projects);
});

// 🚀 Добавить проект (требуется JWT)
app.post("/api/projects", authenticateToken, (req, res) => {
  const { photo, title, description, workType, client } = req.body;

  if (!photo || !title || !description || !workType || !client) {
    return res.status(400).json({ 
      message: "Введите все поля: photo, title, description, workType, client" 
    });
  }

  const newProject = { photo, title, description, workType, client };
  projects.push(newProject);

  res.status(201).json({
    message: "Проект добавлен",
    project: newProject
  });
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
