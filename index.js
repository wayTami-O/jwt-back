import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();
app.use(express.json());

// Полная Swagger спецификация без чтения файлов (для работы на Vercel)
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "JWT Back API",
    version: "1.0.0",
    description: "API для работы с JWT аутентификацией и статичными данными",
  },
  servers: [
    {
      url: "https://jwt-back-ivory.vercel.app",
      description: "Production server",
    },
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/": {
      get: {
        summary: "Проверка работоспособности API",
        tags: ["Health"],
        responses: {
          "200": { description: "Backend работает" },
        },
      },
    },
    "/api/register": {
      post: {
        summary: "Регистрация нового пользователя",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password", "phone"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Регистрация успешна" },
          "400": { description: "Ошибка валидации" },
        },
      },
    },
    "/api/login": {
      post: {
        summary: "Вход в систему",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password", "phone"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Вход успешен" },
          "401": { description: "Неверные данные" },
        },
      },
    },
    "/api/refresh": {
      post: {
        summary: "Обновление токенов",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: { type: "string", description: "Refresh token" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Токены обновлены" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
    },
    "/api/logout": {
      post: {
        summary: "Выход из системы",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: { type: "string", description: "Refresh token" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Выход успешен" },
          "400": { description: "Неверный запрос" },
        },
      },
    },
    "/api/protected": {
      get: {
        summary: "Защищенный эндпоинт",
        tags: ["Protected"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Доступ разрешен" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
    },
    "/api/users": {
      get: {
        summary: "Получить список всех пользователей",
        tags: ["Users"],
        responses: {
          "200": { description: "Список пользователей" },
        },
      },
    },
    "/api/contacts": {
      get: {
        summary: "Получить контакты",
        tags: ["Contacts"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Контакты" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
      post: {
        summary: "Добавить/обновить контакты",
        tags: ["Contacts"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  phone: { type: "string" },
                  address: { type: "string" },
                  email: { type: "string" },
                  title: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Контакты обновлены" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
    },
    "/api/advantages": {
      get: {
        summary: "Получить список преимуществ",
        tags: ["Advantages"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Список преимуществ" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
      post: {
        summary: "Добавить преимущество",
        tags: ["Advantages"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Преимущество добавлено" },
          "400": { description: "Ошибка валидации" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
    },
    "/api/projects": {
      get: {
        summary: "Получить список проектов",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Список проектов" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
      post: {
        summary: "Добавить проект",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["photo", "title", "description", "workType", "client"],
                properties: {
                  photo: { type: "string", description: "Ссылка на фото" },
                  title: { type: "string" },
                  description: { type: "string" },
                  workType: { type: "string", description: "Тип работы" },
                  client: { type: "string", description: "Заказчик" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Проект добавлен" },
          "400": { description: "Ошибка валидации" },
          "401": { description: "Не авторизован" },
          "403": { description: "Неверный токен" },
        },
      },
    },
  },
};

// Настройка Swagger UI
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "JWT Back API Documentation",
};

try {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Альтернативный эндпоинт для проверки спецификации
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(swaggerSpec);
  });
} catch (error) {
  console.error("Ошибка при настройке Swagger UI:", error.message);
}

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

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Регистрация успешна
 *       400:
 *         description: Ошибка валидации
 */
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

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Вход успешен
 *       401:
 *         description: Неверные данные
 */
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

/**
 * @swagger
 * /api/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Токены обновлены
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
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

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Выход успешен
 *       400:
 *         description: Неверный запрос
 */
app.post("/api/logout", (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(400);

  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Вы вышли из системы" });
});

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Защищенный эндпоинт
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Доступ разрешен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Добро пожаловать в защищённый эндпоинт!",
    user: req.user
  });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 */
// 👥 Получить всех пользователей (без паролей)
app.get("/api/users", (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Получить контакты
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Контакты
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
// 📞 Получить контакты (требуется JWT)
app.get("/api/contacts", authenticateToken, (req, res) => {
  res.json(contacts);
});

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Добавить/обновить контакты
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Контакты обновлены
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
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

/**
 * @swagger
 * /api/advantages:
 *   get:
 *     summary: Получить список преимуществ
 *     tags: [Advantages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список преимуществ
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
// ⭐ Получить преимущества (требуется JWT)
app.get("/api/advantages", authenticateToken, (req, res) => {
  res.json(advantages);
});

/**
 * @swagger
 * /api/advantages:
 *   post:
 *     summary: Добавить преимущество
 *     tags: [Advantages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Преимущество добавлено
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
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

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Получить список проектов
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список проектов
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
// 🚀 Получить проекты (требуется JWT)
app.get("/api/projects", authenticateToken, (req, res) => {
  res.json(projects);
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Добавить проект
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *               - title
 *               - description
 *               - workType
 *               - client
 *             properties:
 *               photo:
 *                 type: string
 *                 description: Ссылка на фото
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               workType:
 *                 type: string
 *                 description: Тип работы
 *               client:
 *                 type: string
 *                 description: Заказчик
 *     responses:
 *       201:
 *         description: Проект добавлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Неверный токен
 */
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

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка работоспособности API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Backend работает
 */
// 🌍 Для проверки
app.get("/", (req, res) => {
  res.send("Backend работает 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Экспорт для Vercel
export default app;
