# Certify Backend API

Node.js (Express) REST API สำหรับระบบ Certify ออกแบบด้วย **Repository Pattern** (`src/repositories/`) เพื่อเริ่มต้นเก็บข้อมูลลงไฟล์ JSON (`data/db.json`) ได้ทันที และสลับไปใช้ฐานข้อมูลจริง (PostgreSQL / MySQL / MongoDB / Prisma) ในอนาคตได้โดยไม่ต้องแก้ Route หรือ Business Service

## เริ่มใช้งาน

```bash
cd backend
npm install
npm run dev
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:4000/api` (ดูตัวอย่างค่าตั้งต้นใน `.env.example`)

## REST API Endpoints

| Method | Path | คำอธิบาย |
| --- | --- | --- |
| `GET` | `/api/health` | ตรวจสถานะเซิร์ฟเวอร์และ `DB_DRIVER` |
| `GET` | `/api/state` | ดึงสถานะข้อมูลทั้งหมด (`courses`, `dsr`, `wallet`, `qrVersion`, `checkedIn`) |
| `POST` | `/api/reset` | รีเซ็ตข้อมูลกลับค่าเริ่มต้น (seed) |
| `POST` | `/api/auth/admin/login` | เข้าสู่ระบบ Admin |
| `POST` | `/api/auth/organizer/login` | เข้าสู่ระบบ Organizer ด้วย DSR ID |
| `POST` | `/api/auth/organizer/password` | เปลี่ยนรหัสผ่าน Organizer |
| `POST` | `/api/auth/thaid` | ยืนยันตัวตน ThaID (mock) |
| `GET` | `/api/courses` | รายการหลักสูตรทั้งหมด |
| `POST` / `PUT` | `/api/courses` / `/api/courses/:id` | สร้างหรือแก้ไขหลักสูตร |
| `DELETE` | `/api/courses/:id` | ลบหลักสูตร |
| `POST` | `/api/courses/regenerate-code` | สุ่มรหัส Check-in / Check-out ใหม่ |
| `POST` | `/api/courses/:id/checkin` | บันทึกการ Check-in |
| `POST` | `/api/courses/:id/unlock-demo` | ปลดล็อกเวลารอ Check-out (เดโม) |
| `POST` | `/api/courses/:id/claim` | บันทึกการรับใบเกียรติบัตรและตัดสต็อกโค้ดเน็ต |
| `GET` / `POST` | `/api/dsr` | ดูรายการ / สร้างบัญชี DSR ID |
| `PATCH` / `DELETE` | `/api/dsr/:id` | แก้ชื่อ / ลบบัญชี DSR ID |
| `POST` | `/api/dsr/:id/toggle` | เปิด–ปิดใช้งานบัญชี DSR ID |
| `POST` | `/api/dsr/:id/reset-password` | รีเซ็ตรหัสผ่านชั่วคราว DSR ID |
| `GET` | `/api/wallet` | ดูสต็อกโค้ดเน็ตทุกเครือข่าย |
| `POST` | `/api/wallet/adjust` | เติมหรือตัดสต็อกโค้ดเน็ต |
| `GET` / `POST` | `/api/qr` / `/api/qr/rotate` | ดูเวอร์ชัน / ออก Universal QR เวอร์ชันใหม่ |

## วิธีเปลี่ยนไปใช้ Database จริงในอนาคต

1. สร้างไฟล์ adapter ใหม่ใน `src/repositories/` ที่สืบทอดจาก `BaseRepository` (`src/repositories/baseRepository.js`) เช่น `postgresRepository.js`, `mysqlRepository.js` หรือ `prismaRepository.js`
2. ลงทะเบียนใน `src/repositories/index.js` ตามค่า `env.dbDriver`
3. ตั้งค่า `.env`:
   ```env
   DB_DRIVER=postgres
   DATABASE_URL=postgresql://user:password@localhost:5432/certify
   ```
4. ไม่ต้องแก้ไขไฟล์ใน `src/routes/` หรือ `src/services/` เลยเพราะทุกเมธอดเป็น `async` อยู่แล้ว
