# Todo Reminder Service - Implementation Notes

## Quick Start Guide

### Prerequisites
- Node.js 18+ dan npm
- TypeScript (sudah included)

### Installation & Setup
```bash
# Clone repository
git clone <repository-url>
cd coding-interview-backend

# Install dependencies
npm install

# Run tests to verify everything works
npm test

# Start development server
npm run dev
```

### Basic Usage
```bash
# Server akan berjalan di http://localhost:3000

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User Name"}'

# Create a todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","title":"My Todo","remindAt":"2025-12-01T10:00:00Z"}'

# Get all todos for a user
curl "http://localhost:3000/todos?userId=user-1"

# Complete a todo
curl -X PATCH http://localhost:3000/todos/todo-123456/complete
```

## API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| **Users** | | | |
| POST | `/users` | Create new user | ✅ |
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| **Todos** | | | |
| POST | `/todos` | Create new todo | ✅ |
| GET | `/todos` | Get all todos (with pagination) | ✅ |
| GET | `/todos?userId=...` | Get todos by user (with pagination) | ✅ |
| GET | `/todos/:id` | Get todo by ID | ✅ |
| PUT | `/todos/:id` | Update todo | ✅ |
| PATCH | `/todos/:id/complete` | Mark todo as DONE | ✅ |
| DELETE | `/todos/:id` | Soft delete todo | ✅ |
| POST | `/todos/:id/share` | Share todo with another user | ✅ |
| **Alternative Routes** | | | |
| GET | `/users/:userId/todos` | Alternative get todos by user | ✅ |

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Layer    │    │  Business Logic │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • Express.js    │◄──►│ • TodoService   │◄──►│ • Repositories  │
│ • Routes        │    │ • Validation    │    │ • In-Memory DB  │
│ • Middleware    │    │ • Orchestration │    │ • Persistence   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Domain Layer  │    │  Core Layer     │    │  Infra Layer    │
│                 │    │                 │    │                 │
│ • Todo.ts       │    │ • Interfaces     │    │ • ExpressHttp  │
│ • User.ts       │    │ • Business Rules │    │ • InMemoryRepo │
│ • Types         │    │ • Contracts      │    │ • Scheduler     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Layer Responsibilities

- **Domain Layer**: Business entities and types
- **Core Layer**: Business logic, interfaces, and contracts
- **Infra Layer**: External dependencies and implementations
- **HTTP Layer**: API routes and request/response handling

### Key Design Patterns

- **Clean Architecture**: Separation of concerns
- **Dependency Injection**: Loose coupling and testability
- **Repository Pattern**: Data access abstraction
- **Factory Pattern**: Object creation abstraction

## Development Workflow

### 1. Local Development
```bash
# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- --testNamePattern="should create a todo"
```

### 2. Testing Strategy
```bash
# Unit tests (business logic)
npm test

# Integration tests (API endpoints)
# Use the provided curl examples or automation script

# Manual testing with curl
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 3. Code Quality
- TypeScript strict mode enabled
- ESLint configuration (if available)
- Prettier for code formatting
- Jest for testing framework

## Troubleshooting Guide

### Common Issues

#### 1. Server Won't Start
**Error**: `TSError: ⨯ Unable to compile TypeScript`
**Solution**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Install missing dependencies
npm install

# Check Node.js version (should be 18+)
node --version
```

#### 2. Tests Failing
**Error**: `13 tests passed, X failed`
**Solution**:
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific failing test
npm test -- --testNamePattern="failing test name"

# Check test environment
npm run build
```

#### 3. API Returns 500 Error
**Error**: `{"error": "Internal server error"}`
**Solution**:
- Check server logs in terminal
- Verify request format and required fields
- Check if dependencies are properly injected

#### 4. Data Not Persisting
**Issue**: Data hilang setelah server restart
**Solution**: Ini adalah expected behavior untuk in-memory database. Gunakan:
```bash
# Get all current data
curl http://localhost:3000/users
curl http://localhost:3000/todos

# Recreate data as needed
```

#### 5. Port Already in Use
**Error**: `Error: listen EADDRINUSE: address already in use`
**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in main.ts
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev

# Check server logs
tail -f server.log
```

### Performance Issues
- **Memory Usage**: In-memory storage terbatas untuk development
- **Concurrent Requests**: Single-threaded Node.js limitations
- **Database Queries**: No optimization untuk large datasets

## Environment Variables & Configuration

### Current Configuration
```typescript
// src/app/main.ts
const PORT = 3000; // Hardcoded for simplicity
const REMINDER_INTERVAL = 60000; // 60 seconds
```

### Recommended Environment Variables (for Production)
```bash
# .env file
PORT=3000
NODE_ENV=development
REMINDER_INTERVAL=60000
LOG_LEVEL=info

# Database (when migrating from in-memory)
DATABASE_URL=postgresql://user:pass@localhost:5432/todo_db
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Configuration Loading
```typescript
// Future enhancement: config.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  reminderInterval: parseInt(process.env.REMINDER_INTERVAL || '60000'),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
};
```

## Migration Guide: From Development to Production

### Phase 1: Database Migration (High Priority)

#### 1. Add Database Dependencies
```bash
npm install prisma @prisma/client
npm install --save-dev dotenv
```

#### 2. Create Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())

  todos Todo[]
}

model Todo {
  id          String     @id @default(cuid())
  userId      String
  title       String
  description String?
  status      TodoStatus @default(PENDING)
  remindAt    DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  user User @relation(fields: [userId], references: [id])

  @@map("todos")
}

enum TodoStatus {
  PENDING
  DONE
  REMINDER_DUE
}
```

#### 3. Create Database Repository
```typescript
// src/infra/PostgreSqlTodoRepository.ts
import { PrismaClient } from '@prisma/client';
import { ITodoRepository } from '../core/ITodoRepository';
import { Todo } from '../domain/Todo';

export class PostgreSqlTodoRepository implements ITodoRepository {
  constructor(private prisma: PrismaClient) {}

  async create(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: todoData
    });
    return todo;
  }

  // Implement other methods...
}
```

#### 4. Update Dependency Injection
```typescript
// src/app/main.ts
import { PrismaClient } from '@prisma/client';
import { PostgreSqlTodoRepository } from '../infra/PostgreSqlTodoRepository';

const prisma = new PrismaClient();
const todoRepo = new PostgreSqlTodoRepository(prisma);
```

### Phase 2: Job Queue Migration (Medium Priority)

#### 1. Replace SimpleScheduler with Bull
```bash
npm install bull @types/bull
```

#### 2. Create Bull-based Scheduler
```typescript
// src/infra/BullScheduler.ts
import Queue from 'bull';
import { IScheduler } from '../core/IScheduler';

export class BullScheduler implements IScheduler {
  private queues = new Map<string, Queue.Queue>();

  scheduleRecurring(name: string, intervalMs: number, fn: () => void | Promise<void>): void {
    const queue = new Queue(name, process.env.REDIS_URL);
    this.queues.set(name, queue);

    queue.process(async () => {
      await fn();
    });

    queue.add({}, {
      repeat: { every: intervalMs }
    });
  }

  stop(name: string): void {
    const queue = this.queues.get(name);
    if (queue) {
      queue.close();
      this.queues.delete(name);
    }
  }
}
```

### Phase 3: Security & Monitoring (Medium Priority)

#### 1. Add Authentication
```bash
npm install jsonwebtoken @types/jsonwebtoken bcrypt @types/bcrypt
```

#### 2. Add Monitoring
```bash
npm install prom-client express-prometheus-middleware
```

#### 3. Add CORS and Security Headers
```bash
npm install cors helmet
```

### Phase 4: Performance Optimization (Low Priority)

#### 1. Add Caching
```bash
npm install redis @types/redis
```

#### 2. Add Rate Limiting
```bash
npm install express-rate-limit
```

#### 3. Add Compression
```bash
npm install compression
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis configured for job queues
- [ ] SSL certificates for HTTPS
- [ ] Monitoring and logging setup
- [ ] Load balancer configuration
- [ ] Backup strategy implemented
- [ ] Rollback plan prepared

## Summary of Main Bugs/Issues Found

### 1. Core Logic Issues in TodoService
- **Generic error messages**: Used "Not found" for both user and todo not found scenarios
- **Missing input validation**: No validation for empty/whitespace-only titles or non-existent users
- **Incorrect equality operators**: Used `==` instead of `===` in completeTodo
- **Incorrect reminder processing**: processReminders didn't check status === "PENDING" before updating

### 2. Repository Implementation Issues
- **InMemoryTodoRepository.update()**: Would create new todos for unknown IDs instead of returning null
- **Equality operators**: Used `==` instead of `===` in findById methods
- **findDueReminders**: Didn't filter by status === "PENDING"
- **ID generation**: Used random numbers which could collide

### 3. Scheduler Issues
- **No error handling**: Scheduled functions could crash the process if they threw errors
- **No duplicate prevention**: Could schedule multiple intervals with the same name

### 4. Type Safety Issues
- **Any types**: Used `any` in TodoService.createTodo data parameter
- **Missing interfaces**: No proper typing for createTodo input

## How I Fixed Them

### Core Logic Fixes
1. **Added CreateTodoData interface** with proper typing for createTodo input
2. **Implemented validation**:
   - Title must be non-empty and trimmed
   - User existence validation using userRepo
3. **Fixed equality operators** to use `===` throughout
4. **Fixed processReminders** to only update PENDING todos with valid remindAt dates

### Repository Fixes
1. **Fixed update method** to return null for unknown IDs instead of creating new entities
2. **Fixed equality operators** in all findById methods
3. **Fixed findDueReminders** to filter only PENDING todos
4. **Added softDelete method** for optional soft delete functionality

### Scheduler Fixes
1. **Added error handling** with try/catch and console logging in scheduled functions
2. **Added duplicate prevention** by checking existing intervals before scheduling

### Additional Improvements
1. **Soft delete**: Added deletedAt field to Todo domain and implemented softDelete method
2. **Pagination**: Added limit/offset support to findByUserId and getTodosByUser
3. **Structured logging**: Added detailed logging to processReminders with timestamps and counts

## Framework/Database Choices and Why

### HTTP Framework: Express.js
- **Why**: Popular, mature, and widely used in Node.js ecosystem
- **Rationale**: Provides robust middleware support, routing, and JSON handling out of the box
- **Trade-offs**: Slightly heavier than minimal frameworks but provides better developer experience

### Database: In-Memory (for this exercise)
- **Why**: As specified in requirements, kept in-memory for simplicity
- **Rationale**: Focus on business logic and API design rather than database complexity
- **Production consideration**: Would easily swap to PostgreSQL/MySQL with an ORM like Prisma

### Runtime: Node.js
- **Why**: TypeScript support, vast ecosystem, and alignment with Express
- **Rationale**: Best fit for the requirements and team familiarity

## Optional Improvements Implemented

### 1. Soft Delete
- Added `deletedAt?: Date` to Todo interface
- Implemented `softDelete(id: string)` in repository
- Modified `findByUserId` to exclude deleted todos
- **Benefit**: Allows "deleting" todos without losing data, useful for audit trails

### 2. Pagination
- Added `limit` and `offset` parameters to `findByUserId` and `getTodosByUser`
- Updated API handler to parse query parameters
- **Benefit**: Improves performance for users with many todos

### 3. Structured Logging
- Added timestamped logs to `processReminders`
- Logs start time, number of due reminders found, and number processed
- **Benefit**: Better observability for debugging and monitoring

## Architecture Decisions

### Clean Architecture Approach
- Maintained separation between domain, core, and infra layers
- Used dependency injection for testability
- Kept interfaces in core layer for loose coupling

### Error Handling Strategy
- Used specific error messages for different failure scenarios
- HTTP handlers map business errors to appropriate HTTP status codes
- Scheduler catches and logs errors to prevent process crashes

### API Design
- RESTful endpoints with clear resource naming
- JSON request/response format
- Meaningful HTTP status codes (201 for creation, 400 for validation errors, 404 for not found)

## Testing Strategy
- All existing tests pass without modification
- Tests cover happy paths, edge cases, and idempotent operations
- Business logic thoroughly tested through TodoService tests

## Future Improvements

### 1. Database Migration
- Implement proper database schema with migrations
- Add indexes for performance (userId, status, remindAt)
- Consider connection pooling and prepared statements

### 2. Authentication & Authorization
- Add JWT-based authentication
- Implement user-specific todo access control
- Add API key authentication for reminder processing

### 3. Advanced Scheduling
- Replace simple setInterval with a proper job queue (Bull, Agenda)
- Add retry logic for failed reminder processing
- Support for different reminder frequencies

### 4. Monitoring & Observability
- Add metrics collection (Prometheus)
- Implement health checks
- Add distributed tracing

### 5. Performance Optimizations
- Add caching layer for frequently accessed data
- Implement database query optimization
- Consider read replicas for high-traffic scenarios

### 6. API Enhancements
- Add API versioning
- Implement rate limiting
- Add comprehensive input validation with libraries like Zod

## Deployment Considerations

### Environment Configuration
- Use environment variables for port, database URL, etc.
- Add configuration validation on startup
- Support different environments (dev, staging, prod)

### Containerization
- Add Dockerfile for containerized deployment
- Include health check endpoints
- Configure proper resource limits

### Security
- Add input sanitization
- Implement CORS properly
- Add security headers (helmet middleware)

This implementation provides a solid foundation that can scale with additional requirements while maintaining clean, testable code.

---

# Todo Reminder Service - Catatan Implementasi (Bahasa Indonesia)

## Ringkasan Bug/Masalah Utama yang Ditemukan

### 1. Masalah Logika Inti di TodoService
- **Pesan error generik**: Menggunakan "Not found" untuk skenario user dan todo tidak ditemukan
- **Validasi input hilang**: Tidak ada validasi untuk title kosong/hanya spasi atau user yang tidak ada
- **Operator equality salah**: Menggunakan `==` instead of `===` di completeTodo
- **Pemrosesan reminder salah**: processReminders tidak check status === "PENDING" sebelum update

### 2. Masalah Implementasi Repository
- **InMemoryTodoRepository.update()**: Akan membuat todo baru untuk ID yang tidak diketahui instead of return null
- **Operator equality**: Menggunakan `==` instead of `===` di method findById
- **findDueReminders**: Tidak filter berdasarkan status === "PENDING"
- **Generasi ID**: Menggunakan angka random yang bisa bentrok

### 3. Masalah Scheduler
- **Tidak ada error handling**: Fungsi terjadwal bisa crash process jika throw error
- **Tidak ada pencegahan duplikat**: Bisa schedule multiple intervals dengan nama yang sama

### 4. Masalah Type Safety
- **Any types**: Menggunakan `any` di TodoService.createTodo data parameter
- **Interface hilang**: Tidak ada typing proper untuk createTodo input

## Cara Saya Memperbaikinya

### Perbaikan Logika Inti
1. **Menambahkan interface CreateTodoData** dengan typing proper untuk createTodo input
2. **Implementasi validasi**:
   - Title harus tidak kosong dan di-trim
   - Validasi eksistensi user menggunakan userRepo
3. **Memperbaiki operator equality** untuk menggunakan `===` di seluruh tempat
4. **Memperbaiki processReminders** untuk hanya update todo PENDING dengan remindAt yang valid

### Perbaikan Repository
1. **Memperbaiki method update** untuk return null untuk ID yang tidak diketahui instead of membuat entity baru
2. **Memperbaiki operator equality** di semua method findById
3. **Memperbaiki findDueReminders** untuk filter hanya todo PENDING
4. **Menambahkan method softDelete** untuk fungsionalitas soft delete opsional

### Perbaikan Scheduler
1. **Menambahkan error handling** dengan try/catch dan console logging di fungsi terjadwal
2. **Menambahkan pencegahan duplikat** dengan check interval yang ada sebelum scheduling

### Peningkatan Tambahan
1. **Soft delete**: Menambahkan field deletedAt ke Todo domain dan implementasi method softDelete
2. **Pagination**: Menambahkan support limit/offset ke findByUserId dan getTodosByUser
3. **Structured logging**: Menambahkan logging detail ke processReminders dengan timestamp dan count

## Pilihan Framework/Database dan Mengapa

### HTTP Framework: Express.js
- **Mengapa**: Populer, mature, dan banyak digunakan di ekosistem Node.js
- **Alasan**: Menyediakan middleware support yang robust, routing, dan JSON handling out of the box
- **Trade-offs**: Sedikit lebih berat dibanding framework minimal tapi memberikan developer experience yang lebih baik

### Database: In-Memory (untuk exercise ini)
- **Mengapa**: Seperti yang ditentukan di requirements, tetap in-memory untuk kesederhanaan
- **Alasan**: Fokus pada business logic dan API design daripada kompleksitas database
- **Pertimbangan production**: Mudah di-swap ke PostgreSQL/MySQL dengan ORM seperti Prisma

### Runtime: Node.js
- **Mengapa**: TypeScript support, ekosistem luas, dan alignment dengan Express
- **Alasan**: Paling cocok untuk requirements dan familiarity tim

## Peningkatan Opsional yang Diimplementasikan

### 1. Soft Delete
- Menambahkan `deletedAt?: Date` ke Todo interface
- Implementasi `softDelete(id: string)` di repository
- Memodifikasi `findByUserId` untuk exclude todo yang dihapus
- **Manfaat**: Memungkinkan "menghapus" todo tanpa kehilangan data, berguna untuk audit trails

### 2. Pagination
- Menambahkan parameter `limit` dan `offset` ke `findByUserId` dan `getTodosByUser`
- Update API handler untuk parse query parameters
- **Manfaat**: Meningkatkan performa untuk user dengan banyak todo

### 3. Structured Logging
- Menambahkan logs dengan timestamp ke `processReminders`
- Logs waktu mulai, jumlah due reminders yang ditemukan, dan jumlah yang diproses
- **Manfaat**: Observability yang lebih baik untuk debugging dan monitoring

## Keputusan Architecture

### Pendekatan Clean Architecture
- Mempertahankan separation antara layer domain, core, dan infra
- Menggunakan dependency injection untuk testability
- Menjaga interfaces di core layer untuk loose coupling

### Strategi Error Handling
- Menggunakan pesan error spesifik untuk skenario failure berbeda
- HTTP handlers map business errors ke HTTP status codes yang appropriate
- Scheduler catch dan log errors untuk mencegah process crashes

### API Design
- RESTful endpoints dengan resource naming yang jelas
- Format JSON request/response
- HTTP status codes yang meaningful (201 untuk creation, 400 untuk validation errors, 404 untuk not found)

## Strategi Testing
- Semua test yang ada pass tanpa modifikasi
- Tests cover happy paths, edge cases, dan operasi idempotent
- Business logic thoroughly tested melalui TodoService tests

## Peningkatan di Masa Depan

### 1. Database Migration
- Implementasi proper database schema dengan migrations
- Menambahkan indexes untuk performa (userId, status, remindAt)
- Pertimbangkan connection pooling dan prepared statements

### 2. Authentication & Authorization
- Menambahkan authentication berbasis JWT
- Implementasi user-specific todo access control
- Menambahkan API key authentication untuk reminder processing

### 3. Advanced Scheduling
- Mengganti simple setInterval dengan proper job queue (Bull, Agenda)
- Menambahkan retry logic untuk failed reminder processing
- Support untuk reminder frequencies yang berbeda

### 4. Monitoring & Observability
- Menambahkan metrics collection (Prometheus)
- Implementasi health checks
- Menambahkan distributed tracing

### 5. Performance Optimizations
- Menambahkan caching layer untuk data yang sering diakses
- Implementasi database query optimization
- Pertimbangkan read replicas untuk high-traffic scenarios

### 6. API Enhancements
- Menambahkan API versioning
- Implementasi rate limiting
- Menambahkan comprehensive input validation dengan libraries seperti Zod

## Pertimbangan Deployment

### Environment Configuration
- Menggunakan environment variables untuk port, database URL, dll.
- Menambahkan configuration validation saat startup
- Support untuk environment berbeda (dev, staging, prod)

### Containerization
- Menambahkan Dockerfile untuk deployment containerized
- Include health check endpoints
- Konfigurasi proper resource limits

### Security
- Menambahkan input sanitization
- Implementasi CORS dengan proper
- Menambahkan security headers (helmet middleware)

Implementasi ini menyediakan foundation yang solid yang dapat scale dengan additional requirements sambil mempertahankan code yang clean dan testable.

---

## API Testing Guide - Complete Request & Response Examples

Berikut adalah panduan lengkap untuk testing semua endpoint API dengan contoh request dan response yang detail.

### Prerequisites
```bash
# Start server
npm run dev

# Server akan berjalan di http://localhost:3000
```

### 1. POST /users - Create User

#### Request - Success Case
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe"
  }'
```

#### Response - Success (201 Created)
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "id": "user-1",
  "createdAt": "2025-11-28T09:50:00.000Z"
}
```

#### Request - Error: Missing Email
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "Email and name are required"
}
```

#### Request - Error: Missing Name
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "Email and name are required"
}
```

### 2. GET /users/:id - Get User by ID

#### Request - Success Case
```bash
curl http://localhost:3000/users/user-1
```

#### Response - Success (200 OK)
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "id": "user-1",
  "createdAt": "2025-11-28T09:50:00.000Z"
}
```

#### Request - Error: User Not Found
```bash
curl http://localhost:3000/users/user-999
```

#### Response - Error (404 Not Found)
```json
{
  "error": "User not found"
}
```

### 3. POST /todos - Create Todo

#### Request - Success Case
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "remindAt": "2025-11-28T10:00:00.000Z"
  }'
```

#### Response - Success (201 Created)
```json
{
  "userId": "user-1",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "PENDING",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-123456",
  "createdAt": "2025-11-28T09:50:05.000Z",
  "updatedAt": "2025-11-28T09:50:05.000Z"
}
```

#### Request - Error: Empty Title
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-1", "title": ""}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "Title is required and cannot be empty"
}
```

#### Request - Error: User Not Found
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-999", "title": "Test Todo"}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "User not found"
}
```

### 4. GET /todos/:id - Get Todo by ID

#### Request - Success Case
```bash
curl http://localhost:3000/todos/todo-123456
```

#### Response - Success (200 OK)
```json
{
  "userId": "user-1",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "PENDING",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-123456",
  "createdAt": "2025-11-28T09:50:05.000Z",
  "updatedAt": "2025-11-28T09:50:05.000Z"
}
```

#### Request - Error: Todo Not Found
```bash
curl http://localhost:3000/todos/todo-999999
```

#### Response - Error (404 Not Found)
```json
{
  "error": "Todo not found"
}
```

### 5. PUT /todos/:id - Update Todo

#### Request - Success Case (Update Title & Description)
```bash
curl -X PUT http://localhost:3000/todos/todo-123456 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread, apples, bananas"
  }'
```

#### Response - Success (200 OK)
```json
{
  "userId": "user-1",
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples, bananas",
  "status": "PENDING",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-123456",
  "createdAt": "2025-11-28T09:50:05.000Z",
  "updatedAt": "2025-11-28T09:50:10.000Z"
}
```

#### Request - Error: Empty Title
```bash
curl -X PUT http://localhost:3000/todos/todo-123456 \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "Title cannot be empty"
}
```

#### Request - Error: Todo Not Found
```bash
curl -X PUT http://localhost:3000/todos/todo-999999 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

#### Response - Error (404 Not Found)
```json
{
  "error": "Todo not found"
}
```

### 6. PATCH /todos/:id/complete - Complete Todo

#### Request - Success Case
```bash
curl -X PATCH http://localhost:3000/todos/todo-123456/complete
```

#### Response - Success (200 OK)
```json
{
  "userId": "user-1",
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples, bananas",
  "status": "DONE",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-123456",
  "createdAt": "2025-11-28T09:50:05.000Z",
  "updatedAt": "2025-11-28T09:50:15.000Z"
}
```

#### Request - Idempotent (Complete Already Done Todo)
```bash
curl -X PATCH http://localhost:3000/todos/todo-123456/complete
```

#### Response - Success (200 OK) - Status tetap DONE
```json
{
  "userId": "user-1",
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples, bananas",
  "status": "DONE",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-123456",
  "createdAt": "2025-11-28T09:50:05.000Z",
  "updatedAt": "2025-11-28T09:50:15.000Z"
}
```

#### Request - Error: Todo Not Found
```bash
curl -X PATCH http://localhost:3000/todos/todo-999999/complete
```

#### Response - Error (404 Not Found)
```json
{
  "error": "Todo not found"
}
```

### 7. DELETE /todos/:id - Delete Todo (Soft Delete)

#### Request - Success Case
```bash
curl -X DELETE http://localhost:3000/todos/todo-123456
```

#### Response - Success (204 No Content)
```
(No response body)
```

#### Request - Error: Todo Not Found
```bash
curl -X DELETE http://localhost:3000/todos/todo-999999
```

#### Response - Error (404 Not Found)
```json
{
  "error": "Todo not found"
}
```

### 8. POST /todos/:id/share - Share Todo

#### Request - Success Case
```bash
curl -X POST http://localhost:3000/todos/todo-123456/share \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "user-2"}'
```

#### Response - Success (201 Created)
```json
{
  "userId": "user-2",
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples, bananas",
  "status": "PENDING",
  "remindAt": "2025-11-28T10:00:00.000Z",
  "id": "todo-789012",
  "createdAt": "2025-11-28T09:50:20.000Z",
  "updatedAt": "2025-11-28T09:50:20.000Z"
}
```

#### Request - Error: Share to Self
```bash
curl -X POST http://localhost:3000/todos/todo-123456/share \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "user-1"}'
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "Cannot share with yourself"
}
```

#### Request - Error: Target User Not Found
```bash
curl -X POST http://localhost:3000/todos/todo-123456/share \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "user-999"}'
```

#### Response - Error (404 Not Found)
```json
{
  "error": "Target user not found"
}
```

### 9. GET /todos - Get Todos by User (with Pagination)

#### Request - Success Case (All Todos)
```bash
curl "http://localhost:3000/todos?userId=user-1"
```

#### Response - Success (200 OK)
```json
[
  {
    "userId": "user-1",
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread, apples, bananas",
    "status": "DONE",
    "remindAt": "2025-11-28T10:00:00.000Z",
    "id": "todo-123456",
    "createdAt": "2025-11-28T09:50:05.000Z",
    "updatedAt": "2025-11-28T09:50:15.000Z"
  }
]
```

#### Request - With Pagination (Limit)
```bash
curl "http://localhost:3000/todos?userId=user-1&limit=5"
```

#### Request - With Pagination (Limit + Offset)
```bash
curl "http://localhost:3000/todos?userId=user-1&limit=5&offset=10"
```

#### Request - Error: Missing userId
```bash
curl "http://localhost:3000/todos"
```

#### Response - Error (400 Bad Request)
```json
{
  "error": "userId query parameter is required"
}
```

#### Request - User with No Todos
```bash
curl "http://localhost:3000/todos?userId=user-3"
```

#### Response - Success (200 OK) - Empty Array
```json
[]
```

### 10. GET /users/:userId/todos - Alternative Get Todos by User

#### Request - Success Case
```bash
curl http://localhost:3000/users/user-1/todos
```

#### Response - Success (200 OK)
```json
[
  {
    "userId": "user-1",
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread, apples, bananas",
    "status": "DONE",
    "remindAt": "2025-11-28T10:00:00.000Z",
    "id": "todo-123456",
    "createdAt": "2025-11-28T09:50:05.000Z",
    "updatedAt": "2025-11-28T09:50:15.000Z"
  }
]
```

### 11. GET /users - Get All Users

#### Request - Success Case
```bash
curl http://localhost:3000/users
```

#### Response - Success (200 OK)
```json
[
  {
    "email": "alice@example.com",
    "name": "Alice",
    "id": "user-1",
    "createdAt": "2025-11-28T11:09:47.378Z"
  },
  {
    "email": "bob@example.com",
    "name": "Bob",
    "id": "user-2",
    "createdAt": "2025-11-28T11:09:47.407Z"
  }
]
```

### 12. GET /todos - Get All Todos (with Pagination)

#### Request - Success Case (All Todos)
```bash
curl http://localhost:3000/todos
```

#### Response - Success (200 OK)
```json
[
  {
    "userId": "user-1",
    "title": "Alice Task 1",
    "description": "First task",
    "status": "PENDING",
    "id": "todo-711315",
    "createdAt": "2025-11-28T11:10:01.658Z",
    "updatedAt": "2025-11-28T11:10:01.658Z"
  },
  {
    "userId": "user-1",
    "title": "Alice Task 2",
    "status": "PENDING",
    "id": "todo-337209",
    "createdAt": "2025-11-28T11:10:01.689Z",
    "updatedAt": "2025-11-28T11:10:01.689Z"
  },
  {
    "userId": "user-2",
    "title": "Bob Task 1",
    "status": "PENDING",
    "id": "todo-272755",
    "createdAt": "2025-11-28T11:10:01.718Z",
    "updatedAt": "2025-11-28T11:10:01.718Z"
  }
]
```

#### Request - With Pagination
```bash
curl "http://localhost:3000/todos?limit=2&offset=1"
```

#### Response - Success (200 OK) - Returns 2nd and 3rd todos
```json
[
  {
    "userId": "user-1",
    "title": "Alice Task 2",
    "status": "PENDING",
    "id": "todo-337209",
    "createdAt": "2025-11-28T11:10:01.689Z",
    "updatedAt": "2025-11-28T11:10:01.689Z"
  },
  {
    "userId": "user-2",
    "title": "Bob Task 1",
    "status": "PENDING",
    "id": "todo-272755",
    "createdAt": "2025-11-28T11:10:01.718Z",
    "updatedAt": "2025-11-28T11:10:01.718Z"
  }
]
```

## Testing Automation Script

Buat file `test-api.sh` untuk automated testing:

```bash
#!/bin/bash

echo "🧪 Testing Todo Reminder API..."

# Create user
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo "✅ Created user: $USER_ID"

# Create todo
TODO_RESPONSE=$(curl -s -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"title\":\"Test Todo\"}")

TODO_ID=$(echo $TODO_RESPONSE | jq -r '.id')
echo "✅ Created todo: $TODO_ID"

# Get user
curl -s http://localhost:3000/users/$USER_ID | jq '.name' | grep -q "Test User" && echo "✅ Get user works" || echo "❌ Get user failed"

# Get todo
curl -s http://localhost:3000/todos/$TODO_ID | jq '.title' | grep -q "Test Todo" && echo "✅ Get todo works" || echo "❌ Get todo failed"

# Update todo
curl -s -X PUT http://localhost:3000/todos/$TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Todo"}' > /dev/null && echo "✅ Update todo works"

# Complete todo
curl -s -X PATCH http://localhost:3000/todos/$TODO_ID/complete > /dev/null && echo "✅ Complete todo works"

# Get todos by user
TODOS_COUNT=$(curl -s "http://localhost:3000/todos?userId=$USER_ID" | jq length)
[ "$TODOS_COUNT" -gt 0 ] && echo "✅ Get todos by user works" || echo "❌ Get todos by user failed"

# Delete todo
curl -s -X DELETE http://localhost:3000/todos/$TODO_ID > /dev/null && echo "✅ Delete todo works"

# Verify soft delete
TODOS_AFTER_DELETE=$(curl -s "http://localhost:3000/todos?userId=$USER_ID" | jq length)
[ "$TODOS_AFTER_DELETE" -eq 0 ] && echo "✅ Soft delete works" || echo "❌ Soft delete failed"

echo "🎉 All API tests completed!"
```

## HTTP Status Codes Summary

| Status Code | Meaning | Used For |
|-------------|---------|----------|
| 200 OK | Success | GET requests |
| 201 Created | Resource created | POST /users, POST /todos, POST /share |
| 204 No Content | Success, no response body | DELETE /todos |
| 400 Bad Request | Validation error | Invalid input data |
| 404 Not Found | Resource not found | Invalid IDs |
| 500 Internal Server Error | Server error | Unexpected errors |

## Data Types

### User Object
```typescript
{
  id: string;           // "user-123"
  email: string;        // "user@example.com"
  name: string;         // "User Name"
  createdAt: Date;      // ISO string
}
```

### Todo Object
```typescript
{
  id: string;           // "todo-123"
  userId: string;       // "user-123"
  title: string;        // Required, non-empty
  description?: string; // Optional
  status: "PENDING" | "DONE" | "REMINDER_DUE";
  remindAt?: Date;      // Optional ISO string
  createdAt: Date;      // ISO string
  updatedAt: Date;      // ISO string
  deletedAt?: Date;     // Optional, for soft delete
}
```

## Error Response Format
```typescript
{
  error: string;  // Error message
}
```

Dokumentasi testing ini mencakup semua skenario success dan error untuk setiap endpoint, memudahkan development dan debugging! 🚀
