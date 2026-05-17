# Quizmaster

Quizmaster là một web app tạo và làm bài trắc nghiệm trực tuyến, gồm **Backend NestJS + Prisma + PostgreSQL** và **Frontend React + TypeScript + Vite**. Dự án hỗ trợ luồng người dùng làm quiz, luồng admin quản lý quiz/câu hỏi/category/user, theo dõi lượt làm bài và phát hiện các hành vi đáng ngờ trong quá trình làm bài.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Tech stack](#tech-stack)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Luồng nghiệp vụ chính](#luồng-nghiệp-vụ-chính)
- [Cài đặt local](#cài-đặt-local)
- [Chạy bằng Docker Compose](#chạy-bằng-docker-compose)
- [Biến môi trường](#biến-môi-trường)
- [Database và Prisma](#database-và-prisma)
- [Deploy production](#deploy-production)
- [Tài khoản admin và dữ liệu demo](#tài-khoản-admin-và-dữ-liệu-demo)
- [Scripts](#scripts)
- [Ghi chú bảo mật](#ghi-chú-bảo-mật)

---

## Tính năng chính

### Người dùng

- Đăng ký, đăng nhập, đăng xuất.
- Refresh token bằng HttpOnly cookie.
- Xem danh sách quiz đã publish.
- Xem chi tiết quiz.
- Làm quiz public hoặc quiz yêu cầu password.
- Tự động submit khi hết giờ.
- Xem kết quả sau khi làm bài.
- Theo dõi lịch sử làm bài.
- Ghi nhận một số event trong quá trình làm bài như chuyển tab, quay lại tab, copy attempt, right click và auto submit.

### Admin

- Dashboard tổng quan hệ thống.
- Quản lý categories.
- Quản lý ngân hàng câu hỏi.
- Quản lý quizzes.
- Thêm câu hỏi vào quiz theo đúng category của quiz.
- Quản lý user, role và trạng thái hoạt động.
- Theo dõi recent attempts.
- Theo dõi suspicious attempts.
- Xem event timeline của một attempt đáng ngờ.
- Hỗ trợ soft delete, restore và permanent delete ở các phần phù hợp.
- UI/UX admin đã được polish với header đồng bộ, filter rõ ràng, table dễ đọc, badge trạng thái, form chia section và responsive layout.

---

## Tech stack

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport JWT
- Cookie Parser
- Bcrypt
- Class Validator / Class Transformer
- Cloudinary
- Docker

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui style components
- Radix UI
- Lucide React
- Sonner Toast
- Recharts

### Infrastructure

- Docker Compose cho local full-stack.
- PostgreSQL local bằng Docker.
- Neon PostgreSQL cho production database.
- Render cho backend production.
- Vercel cho frontend production.

---

## Cấu trúc thư mục

```txt
Website_Quizmaster/
├── quizmaster-backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── common/
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   ├── attempts/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── questions/
│   │   │   ├── quizzes/
│   │   │   ├── users/
│   │   │   └── prisma/
│   │   └── main.ts
│   ├── Dockerfile
|   ├── docker-compose.yml
│   └── package.json
│
├── quizmaster-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── attempts/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   ├── questions/
│   │   │   ├── quizzes/
│   │   │   └── users/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── config/
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.docker
└── .gitignore
```

---

## Kiến trúc tổng quan

```txt
User Browser
    |
    | HTTPS
    v
Frontend React / Vercel
    |
    | REST API + credentials
    v
Backend NestJS / Render
    |
    | Prisma ORM
    v
PostgreSQL / Neon
```

Local Docker architecture:

```txt
quizmaster-frontend  -> port 8080
quizmaster-backend   -> port 3000
quizmaster-postgres  -> port 5434
```

---

## Luồng nghiệp vụ chính

### 1. Admin tạo quiz hoàn chỉnh

```txt
Tạo category
→ Tạo câu hỏi theo category
→ Tạo quiz theo category
→ Thêm câu hỏi cùng category vào quiz
→ Publish quiz
→ User vào làm bài
→ Admin theo dõi attempts
```

Ví dụ:

```txt
Category: SQL

Quiz:
- SQL Basic Quiz
- SQL Advanced Quiz

Questions:
- Chỉ các câu hỏi thuộc category SQL mới được thêm vào quiz SQL
```

### 2. User làm quiz

```txt
User login
→ Xem danh sách quiz
→ Chọn quiz
→ Nếu quiz có password thì nhập password
→ Start attempt
→ Làm bài
→ Submit hoặc auto submit khi hết giờ
→ Xem kết quả
```

### 3. Suspicious attempt monitoring

Trong lúc user làm bài, hệ thống có thể ghi nhận các event:

```txt
tab_blur
tab_focus
copy_attempt
right_click
auto_submitted
```

Admin có thể xem:

```txt
Recent Attempts
Suspicious Attempts
Event Timeline
```

---

## Cài đặt local

### Yêu cầu

- Node.js
- npm
- PostgreSQL
- Docker Desktop nếu chạy bằng Docker
- Git

### Clone project

```bash
git clone https://github.com/luom04/Website_Quizmaster.git
cd Website_Quizmaster
```

---

## Cài đặt Backend

```bash
cd quizmaster-backend
npm install
```

Tạo file `.env` trong `quizmaster-backend`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/quizdb?schema=public"
AT_SECRET="your_access_token_secret"
RT_SECRET="your_refresh_token_secret"
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLOUDINARY_FOLDER="quizmaster"
```

Chạy Prisma migration:

```bash
npx prisma migrate dev
npx prisma generate
```

Chạy backend:

```bash
npm run start:dev
```

Backend chạy tại:

```txt
http://localhost:3000
```

---

## Cài đặt Frontend

```bash
cd quizmaster-frontend
npm install
```

Tạo file `.env` trong `quizmaster-frontend`:

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_APP_NAME="Quizmaster"
VITE_ENABLE_AGENTATION="false"
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

---

## Chạy bằng Docker Compose

Ở root project, tạo file `.env.docker`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=quizdb
POSTGRES_PORT=5434

BACKEND_PORT=3000
FRONTEND_PORT=8080

DATABASE_URL=postgresql://postgres:postgres@db:5432/quizdb?schema=public
NODE_ENV=production
FRONTEND_URL=http://localhost:8080

AT_SECRET=change_me_access_secret
RT_SECRET=change_me_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=quizmaster

VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Quizmaster
VITE_ENABLE_AGENTATION=false
```

Chạy full app:

```bash
docker compose --env-file .env.docker up --build -d
```

Kiểm tra containers:

```bash
docker compose --env-file .env.docker ps
```

Truy cập:

```txt
Frontend: http://localhost:8080
Backend:  http://localhost:3000
Database: localhost:5434
```

Dừng containers:

```bash
docker compose --env-file .env.docker stop
```

Xóa containers nhưng giữ database volume:

```bash
docker compose --env-file .env.docker down
```

Xóa cả database volume:

```bash
docker compose --env-file .env.docker down -v
```

---

## Biến môi trường

### Backend

| Biến | Ý nghĩa |
|---|---|
| `NODE_ENV` | Môi trường chạy app |
| `PORT` | Port backend |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | URL frontend để cấu hình CORS/cookie |
| `AT_SECRET` | Secret ký access token |
| `RT_SECRET` | Secret ký refresh token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | Folder upload trên Cloudinary |

### Frontend

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_BASE_URL` | Base URL backend API |
| `VITE_APP_NAME` | Tên app hiển thị |
| `VITE_ENABLE_AGENTATION` | Bật/tắt Agentation trong frontend |

---

## Database và Prisma

Generate Prisma Client:

```bash
cd quizmaster-backend
npx prisma generate
```

Tạo migration development:

```bash
npx prisma migrate dev --name migration_name
```

Apply migration production:

```bash
npx prisma migrate deploy
```

Mở Prisma Studio:

```bash
npx prisma studio
```

---

## Deploy production

### Database

Dự án dùng Neon PostgreSQL.

Production `DATABASE_URL` có dạng:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require"
```

### Backend trên Render

Các biến môi trường cần cấu hình trên Render:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=...
FRONTEND_URL=https://your-vercel-domain.vercel.app
AT_SECRET=...
RT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=quizmaster
```

Khi deploy production, backend cần chạy Prisma migration:

```bash
npx prisma migrate deploy
```

### Frontend trên Vercel

Các biến môi trường cần cấu hình trên Vercel:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
VITE_APP_NAME=Quizmaster
VITE_ENABLE_AGENTATION=false
```

Nếu dùng React Router với Vercel, cần rewrite toàn bộ route về `index.html` để tránh lỗi reload route bị `404`.

Ví dụ `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Tài khoản admin và dữ liệu demo

Sau khi reset database, user mới đăng ký mặc định là role `user`.

Để set admin trực tiếp trong Neon/PostgreSQL:

```sql
UPDATE users
SET role = 'admin'::"Role", updated_at = NOW()
WHERE email = 'admin@gmail.com';
```

Kiểm tra:

```sql
SELECT id, email, role
FROM users
WHERE email = 'admin@gmail.com';
```

### Dữ liệu demo gợi ý

Có thể tạo dữ liệu demo theo các category:

```txt
SQL
- SQL Basic Quiz
- SQL Advanced Quiz

Python
- Python Basic Quiz
- Python Advanced Quiz

Data Engineering
- Data Engineering Basic Quiz
- Data Engineering Advanced Quiz

Toán học
- Toán học Cấp 1 Basic Quiz
- Toán học Cấp 1 Advanced Quiz
- Toán học Cấp 2 Basic Quiz
- Toán học Cấp 2 Advanced Quiz

Từ vựng tiếng Anh
- English Vocabulary Basic Quiz
- English Vocabulary Intermediate Quiz
- English Vocabulary Advanced Quiz
```

Với quiz có password, cần lưu đúng `access_mode = password_required` và `password_hash`.

Không nên tự lưu password plain text trong production thật. Trong môi trường demo, có thể giữ `password_plain` tạm thời để admin copy, nhưng nên xóa hoặc cho hết hạn theo logic ứng dụng.

---

## Scripts

### Backend

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Một số lệnh Git thường dùng

Tạo branch mới:

```bash
git checkout -b feature/branch-name
```

Kiểm tra thay đổi:

```bash
git status
git diff --name-only
```

Stage và commit:

```bash
git add .
git commit -m "message"
```

Push branch:

```bash
git push origin feature/branch-name
```

Cập nhật main local:

```bash
git checkout main
git pull origin main
```

---

## Ghi chú bảo mật

- Không commit file `.env`, `.env.docker`, `node_modules`, `dist`.
- Không commit access token secret, refresh token secret, Cloudinary secret hoặc database URL thật.
- Refresh token nên lưu bằng HttpOnly cookie.
- Access token nên có thời gian sống ngắn.
- Production database nên dùng SSL.
- Với quiz password, backend nên hash password trước khi lưu.

---

## Production demo

Bạn có thể tham khảo bản production tại:

https://quizmaster-beta-dusky.vercel.app/

Tài khoản admin demo:

Email: admin@gmail.com
Password: admin123

## Tác giả

Dự án được phát triển nhằm mục đích học tập, thực hành full-stack web development với NestJS, React, Prisma, PostgreSQL, Docker và deployment production.
