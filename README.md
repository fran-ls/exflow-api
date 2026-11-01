# 💰 ExFlow API

## 📝 Descripción del sistema

Exflow API es el backend de un sistema de finanzas personales. Permite a los usuarios administrar wallets y registrar transactions de tipo ingreso o gasto. Cada transaction se asocia a una wallet y, al crearla, actualizarla o eliminarla, se ajustan los balances correspondientes. El acceso a la API está protegido mediante autenticación con tokens.

---

## ✨ Características

- ✅ CRUD de Wallet y Transaction.
- ✅ Búsqueda con filtros y paginación.
- ✅ Actualización del balance, ingresos, gastos y conteos de la wallet al crear, modificar o eliminar transactions.
- ✅ POO estricta: Controller → Service → Repository → Prisma.
- ✅ Validación de datos con `express-validator`.
- ✅ Autenticación mediante access token Bearer.
- ✅ Manejo global de errores y respuestas JSON consistentes.
- ✅ Cliente Prisma con conexión PostgreSQL y cierre ordenado del servidor.
- ✅ Helmet + CORS para seguridad básica.

---

## 🧰 Tecnologías utilizadas

- **Node.js 22** y **TypeScript** para ejecutar y desarrollar el backend.
- **Express** para construir la API REST y organizar sus rutas y middlewares.
- **Prisma ORM** con el adaptador PostgreSQL para el acceso a datos y las migraciones.
- **PostgreSQL** como base de datos relacional.
- **JSON Web Tokens** y **bcryptjs** para autenticación y manejo de contraseñas.
- **express-validator** para validar solicitudes.
- **Helmet**, **CORS** y **Morgan** para cabeceras HTTP, acceso entre orígenes y registro de solicitudes.
- **dotenv** para cargar configuración desde variables de entorno.

---

## 🏗️ Arquitectura

```text
src/
├── config/          # Configuración de Express y variables de entorno
├── controllers/     # Handlers HTTP de Wallet y Transaction
├── services/        # Lógica de negocio de Wallet y Transaction
├── repositories/    # Acceso a datos con Prisma
├── middlewares/     # Autenticación, validación y manejo de errores
├── interfaces/      # Tipos e interfaces de la API
├── routes/          # Rutas HTTP
├── database/        # Cliente Prisma y conexión a PostgreSQL
├── generated/       # Cliente Prisma generado
└── index.ts         # Inicio del servidor y cierre ordenado
```

---

## 🚀 Requisitos e instalación

- Node.js `22.22.2`
- PostgreSQL
- npm

```bash
npm install
```

Copia `.env.template` a `.env` y configura, como mínimo, `DATABASE_URL` y los secretos de `JWT_CONFIG`.

Genera el cliente de Prisma, aplica las migraciones e inicia el servidor:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Para compilar y ejecutar la versión compilada:

```bash
npm run build
npm start
```

La API queda disponible en `http://localhost:3000/api`; el puerto se puede cambiar con `PORT`. El endpoint de salud es `GET /api/health`.

---

## 🔐 Autenticación

Todas las rutas de Wallet y Transaction requieren un access token. Inicia sesión en `POST /api/auth/login` y envía el token recibido en el header:

```http
Authorization: Bearer <accessToken>
```

Los endpoints de listado global `GET /api/wallets` y `GET /api/transactions` requieren además el rol `ADMIN`.

---

## 📡 Endpoints

Los endpoints siguientes usan el prefijo `/api`.

### Wallets — `/wallets`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/wallets` | Listar todas las wallets (solo ADMIN) |
| `GET` | `/wallets/search` | Buscar wallets con filtros y paginación |
| `GET` | `/wallets/count` | Contar wallets de un usuario |
| `GET` | `/wallets/stats` | Obtener balance, ingresos, gastos y conteos |
| `GET` | `/wallets/stats/balance` | Obtener el balance total de un usuario |
| `GET` | `/wallets/user/:userId` | Listar las wallets de un usuario |
| `GET` | `/wallets/:id` | Obtener una wallet por ID (incluye hasta 10 transactions recientes) |
| `POST` | `/wallets/new` | Crear una wallet |
| `PATCH` | `/wallets/:id` | Actualizar una wallet |
| `DELETE` | `/wallets/:id` | Eliminar una wallet y sus transactions relacionadas |

#### Filtros de `GET /wallets/search`

`userId` es obligatorio.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | string | ID del usuario |
| `type` | enum | `CASH`, `BANK`, `CREDIT_CARD`, `SAVINGS`, `INVESTMENT`, `OTHER` |
| `name` | string | Buscar por nombre (coincidencia parcial, sin distinguir mayúsculas) |
| `minBalance` | number | Balance mínimo |
| `maxBalance` | number | Balance máximo |
| `page` | number | Página (por defecto `1`) |
| `limit` | number | Resultados por página (por defecto `10`) |
| `orderBy` | string | `name`, `balance`, `incomeCount`, `expenseCount`, `createdAt` |
| `order` | string | `asc` o `desc` (por defecto `desc`) |

`GET /wallets/count` requiere `userId` y acepta `walletId`. `GET /wallets/stats` acepta `userId` y/o `walletId`; `GET /wallets/stats/balance` requiere `userId`.

#### Crear una wallet

`POST /wallets/new`

```json
{
  "name": "Mi cuenta bancaria",
  "color": "#4CAF50",
  "type": "BANK",
  "initBalance": 1000,
  "userId": "user-123"
}
```

`color` debe ser un color hexadecimal. El balance inicial de la wallet se establece con `initBalance`.

### Transactions — `/transactions`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/transactions` | Listar todas las transactions (solo ADMIN) |
| `GET` | `/transactions/search` | Buscar transactions con filtros y paginación |
| `GET` | `/transactions/count` | Contar transactions de un usuario |
| `GET` | `/transactions/year/summary` | Obtener totales y resumen mensual para un rango de fechas |
| `GET` | `/transactions/wallet/:walletId` | Listar transactions de una wallet |
| `GET` | `/transactions/wallet/:walletId/summary` | Obtener totales agrupados por tipo para una wallet |
| `GET` | `/transactions/user/:userId` | Listar transactions de un usuario |
| `GET` | `/transactions/:id` | Obtener una transaction por ID |
| `POST` | `/transactions/new` | Crear una transaction |
| `PATCH` | `/transactions/:id` | Actualizar una transaction |
| `DELETE` | `/transactions/:id` | Eliminar una transaction |

#### Filtros de `GET /transactions/search`

`userId` es obligatorio.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | string | ID del usuario |
| `walletId` | string | Filtrar por wallet |
| `type` | enum | `INCOME` o `EXPENSE` |
| `title` | string | Buscar por título |
| `description` | string | Buscar por descripción |
| `date` | string | Día exacto en formato `YYYY-MM-DD` |
| `dateFrom` | string | Inicio del rango de fechas |
| `dateTo` | string | Fin exclusivo del rango de fechas |
| `minAmount` | number | Monto mínimo |
| `maxAmount` | number | Monto máximo |
| `page` | number | Página (por defecto `1`) |
| `limit` | number | Resultados por página (por defecto `10`) |
| `orderBy` | string | `date`, `amount`, `title`, `createdAt` |
| `order` | string | `asc` o `desc` (por defecto `desc`) |

`GET /transactions/count` requiere `userId` y acepta `walletId` y `date` (`YYYY-MM-DD`). `GET /transactions/year/summary` recibe `userId`, `dateFrom`, `dateTo` y, opcionalmente, `type`.

#### Crear una transaction

`POST /transactions/new`

```json
{
  "title": "Salario",
  "description": "Pago mensual",
  "amount": 1500,
  "date": "2024-03-01",
  "time": "09:00",
  "type": "INCOME",
  "userId": "user-123",
  "walletId": "wallet-uuid"
}
```

`date` debe usar `YYYY-MM-DD`, `time` debe usar `HH:mm` y `amount` debe ser mayor que cero. No se puede crear un gasto superior al balance disponible de la wallet.

---

## 📦 Respuesta

Las respuestas exitosas usan el formato siguiente. `meta` se incluye en las respuestas paginadas:

```json
{
  "success": true,
  "message": "Wallets retrieved successfully",
  "data": [],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## ⚙️ Variables de entorno

`.env.template` incluye la configuración inicial. Las variables principales son:

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | Entorno de ejecución |
| `PORT` | Puerto HTTP (por defecto `3000`) |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `CORS_ORIGIN` | Origen permitido por CORS |
| `JWT_CONFIG` | Configuración JSON para secretos y expiración de tokens |

Configura secretos propios en `JWT_CONFIG` y no compartas ni subas el archivo `.env`.

---