# 💰 Wallet API

REST API con Node.js + TypeScript + Prisma + PostgreSQL.  
Arquitectura escalable basada en POO: Controller → Service → Repository → Prisma.

---

## 🏗️ Arquitectura

```
src/
├── config/
│   └── app.ts               # Express app, middlewares, CORS, Helmet
├── controllers/
│   ├── wallet.controller.ts       # HTTP handlers - Wallet
│   └── transaction.controller.ts  # HTTP handlers - Transaction
├── services/
│   ├── wallet.service.ts          # Business logic - Wallet
│   └── transaction.service.ts     # Business logic + balance sync
├── repositories/
│   ├── base.repository.ts         # Abstract base class (POO)
│   ├── wallet.repository.ts       # Queries Prisma - Wallet
│   └── transaction.repository.ts  # Queries Prisma - Transaction
├── middlewares/
│   ├── wallet.validation.ts       # express-validator rules
│   ├── transaction.validation.ts
│   ├── validateRequest.ts         # Validation result handler
│   └── errorHandler.ts            # Global error handler
├── interfaces/
│   ├── wallet.interface.ts
│   ├── transaction.interface.ts
│   └── common.interface.ts        # ApiResponse, Pagination
├── routes/
│   ├── index.ts
│   ├── wallet.routes.ts
│   └── transaction.routes.ts
├── utils/
│   ├── ApiResponse.ts             # Response builder
│   └── AppError.ts               # Custom errors
├── database/
│   └── prisma.ts                  # Singleton DB connection
└── index.ts                       # Bootstrap + graceful shutdown
```

---

## 🚀 Setup

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL con tu PostgreSQL

# 3. Generar cliente Prisma y correr migraciones
npm run prisma:generate
npm run prisma:migrate

# 4. (Opcional) Seed de datos de prueba
npm run prisma:seed

# 5. Iniciar servidor en modo desarrollo
npm run dev
```

---

## 📡 Endpoints

### Wallets — `/api/wallets`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/wallets` | Listar todas las wallets |
| `GET` | `/api/wallets/search` | Buscar con filtros y paginación |
| `GET` | `/api/wallets/user/:userId` | Wallets de un usuario |
| `GET` | `/api/wallets/:id` | Obtener wallet por ID |
| `POST` | `/api/wallets` | Crear wallet |
| `PATCH` | `/api/wallets/:id` | Actualizar wallet |
| `DELETE` | `/api/wallets/:id` | Eliminar wallet (cascade) |

#### Query params para `/search`:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `userId` | string | Filtrar por usuario |
| `type` | enum | `CASH, BANK, CREDIT_CARD, SAVINGS, INVESTMENT, OTHER` |
| `name` | string | Buscar por nombre (contiene) |
| `minBalance` | number | Balance mínimo |
| `maxBalance` | number | Balance máximo |
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 10) |
| `orderBy` | string | `name, balance, createdAt` |
| `order` | string | `asc, desc` |

#### Body `POST /api/wallets`:
```json
{
  "name": "Mi Cuenta Banco",
  "color": "#4CAF50",
  "type": "BANK",
  "initBalance": 1000,
  "userId": "user-123"
}
```

---

### Transactions — `/api/transactions`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/transactions` | Listar todas las transacciones |
| `GET` | `/api/transactions/search` | Buscar con filtros y paginación |
| `GET` | `/api/transactions/wallet/:walletId` | Transacciones de una wallet |
| `GET` | `/api/transactions/wallet/:walletId/summary` | Resumen income/expense |
| `GET` | `/api/transactions/user/:userId` | Transacciones de un usuario |
| `GET` | `/api/transactions/:id` | Obtener transacción por ID |
| `POST` | `/api/transactions` | Crear transacción (actualiza balance automáticamente) |
| `PATCH` | `/api/transactions/:id` | Actualizar (recalcula balance) |
| `DELETE` | `/api/transactions/:id` | Eliminar (revierte balance) |

#### Query params para `/search`:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `userId` | string | Filtrar por usuario |
| `walletId` | string | Filtrar por wallet |
| `type` | enum | `INCOME, EXPENSE` |
| `title` | string | Buscar por título (contiene) |
| `dateFrom` | string | Desde fecha `YYYY-MM-DD` |
| `dateTo` | string | Hasta fecha `YYYY-MM-DD` |
| `minAmount` | number | Monto mínimo |
| `maxAmount` | number | Monto máximo |
| `page` | number | Página |
| `limit` | number | Límite por página |
| `orderBy` | string | `date, amount, title, createdAt` |
| `order` | string | `asc, desc` |

#### Body `POST /api/transactions`:
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

---

## 📦 Respuesta estándar

```json
{
  "success": true,
  "message": "Wallets retrieved successfully",
  "data": [...],
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

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/wallet_db"
CORS_ORIGIN=*
```

---

## 🔑 Características clave

- ✅ **CRUD completo** para Wallet y Transaction
- ✅ **Filtros avanzados** con paginación en ambas entidades
- ✅ **Balance automático**: crear/editar/eliminar transacciones actualiza `balance`, `income` y `expense` de la wallet
- ✅ **POO estricta**: Controller → Service → Repository → Prisma
- ✅ **Validaciones** con express-validator
- ✅ **Error handling global** con errores Prisma mapeados
- ✅ **Singleton DB** para conexión eficiente
- ✅ **Graceful shutdown**
- ✅ **Helmet + CORS** para seguridad básica
