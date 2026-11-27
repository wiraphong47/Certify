# Certify — สรุปความรู้ สถาปัตยกรรม และบทเรียนจากการพัฒนา

เอกสารนี้รวบรวมความรู้ทางเทคนิค การตัดสินใจด้านสถาปัตยกรรม UX/UI ข้อจำกัดของเบราว์เซอร์ และบทเรียนจากบั๊กที่พบและแก้ไขตลอดการพัฒนาโปรเจกต์ **Certify**

---

## 1. สถาปัตยกรรมโปรเจกต์ (Monorepo: Frontend + Backend)

โปรเจกต์แยกโครงสร้าง **Frontend** และ **Backend** ออกจากกันชัดเจนใน repository เดียว:

```text
certify2/
├── frontend/                  # React 19 + Vite 8 + MUI v9 + React Router v7 (HashRouter)
│   ├── src/
│   │   ├── components/        # UI แยกตามบทบาท (student / organizer / admin / common)
│   │   ├── page/              # Nested routes & layouts
│   │   ├── context/           # CertifyContext (state กลาง + hydrate จาก Backend)
│   │   ├── hooks/             # useVoice, useSwipe, useCourseForm
│   │   ├── services/          # apiClient + services (API-first + localStorage fallback)
│   │   ├── theme/             # ธีมสีสำนักงานฯ Light / Dark mode
│   │   └── utils/             # formatters, thaiSpeech
│   └── vite.config.js         # base: './', proxy /api -> http://localhost:4000
├── backend/                   # Node.js (ES Modules) + Express 5 + cors + dotenv
│   ├── data/                  # เก็บไฟล์ db.json ตอนรันจริง (ถูก gitignore ยกเว้น .gitkeep)
│   └── src/
│       ├── config/env.js      # อ่านค่า PORT, CORS_ORIGIN, DB_DRIVER, DATA_FILE, ADMIN_*
│       ├── repositories/      # Repository Pattern (BaseRepository + JsonRepository)
│       ├── services/          # Business logic (DB-agnostic)
│       ├── routes/            # REST API (/api/auth, /courses, /dsr, /wallet, /qr, /state, /reset)
│       └── app.js, index.js
├── scripts/dev.mjs            # สคริปต์รัน frontend + backend พร้อมกัน (ไม่ต้องลง concurrently)
└── .github/workflows/deploy.yml  # Build จาก frontend/ และ deploy ./frontend/dist ขึ้น GitHub Pages
```

### คำสั่งหลักจากโฟลเดอร์ root
```powershell
npm run install:all    # ติดตั้ง dependencies ทั้ง frontend และ backend
npm run dev            # รันทั้ง Frontend (port 3000) และ Backend (port 4000) พร้อมกัน
npm run dev:frontend   # รันเฉพาะ Frontend
npm run dev:backend    # รันเฉพาะ Backend
npm run lint           # ตรวจโค้ดด้วย oxlint (ใน frontend/)
npm run build          # Build production -> frontend/dist
```

### การเชื่อมต่อ Frontend ↔ Backend และ Fallback
- **โหมดพัฒนา (`npm run dev`)**: Vite proxy `/api/*` → `http://localhost:4000` ลดปัญหา CORS แม้ทดสอบจากมือถือในวง LAN เดียวกัน
- **โหมด Production แยกเซิร์ฟเวอร์**: ตั้งค่า `VITE_API_URL` ใน `frontend/.env`
- **โหมด Static (เช่น GitHub Pages ที่ไม่ตั้ง `VITE_API_URL`)**: `apiClient.js` ข้ามการยิง network และใช้ `localStorage` (`certify_web_db_v1`) ทันทีเพื่อไม่ให้เกิด error 404 ใน console
- **หลักแยก Error ใน `apiClient.js`**:
  - **Backend ติดต่อไม่ได้ / Timeout / 502–504**: Fallback ไปใช้ `localStorage`
  - **Backend ตอบกลับ 4xx พร้อม JSON (`{ ok: false, error }`)** เช่น รหัสผ่านผิด หรือรหัสหลักสูตรซ้ำ: **คืน error นั้นตรง ๆ ห้ามกลบด้วย fallback**

### การออกแบบ Backend ให้รองรับ Database จริงในอนาคต (Repository Pattern)
- `backend/src/repositories/baseRepository.js` กำหนดเมธอดทุกตัวเป็น **`async`**
- ปัจจุบันใช้ `JsonRepository` (`backend/data/db.json`) พร้อมคิวเขียนแบบเรียงลำดับและ atomic rename (`.tmp` → `.json`) ป้องกันไฟล์เสียเมื่อมีคำขอพร้อมกัน
- เมื่อต้องการเปลี่ยนเป็น **PostgreSQL / MySQL / MongoDB / Prisma**:
  1. สร้าง adapter ใหม่ใน `backend/src/repositories/` ที่สืบทอด `BaseRepository`
  2. ลงทะเบียนใน `backend/src/repositories/index.js` ตามค่า `DB_DRIVER`
  3. ตั้ง `DB_DRIVER` และ `DATABASE_URL` ใน `backend/.env` — ไม่ต้องแก้ไฟล์ใน `routes/` หรือ `services/`
- `express.json({ limit: '15mb' })` ตั้งเผื่อข้อมูลภาพลายเซ็น (`sig`, `sig2`) และพื้นหลังใบเกียรติบัตร (`bg`) แบบ base64

---

## 2. ฟีเจอร์หลักและข้อกำหนดของระบบ

- **เส้นทางหลัก (Routing)**:
  - `/` และ `*` redirect ไป `/student/scan`
  - นักเรียน: `/student/scan`, `/student/thaid`, `/student/code` (`?step=checkin|checkout`), `/student/phone`, `/student/certificate`
  - เจ้าหน้าที่: `/login`, `/organizer/overview`, `/organizer/settings`, `/admin/overview`, `/admin/courses`, `/admin/dsr`, `/admin/wallet`, `/admin/qr`
- **บัญชีทดลอง (Demo)**:
  - Admin: `admin` / `admin1234`
  - Organizer: `DSR-0123`, `DSR-0245`, `DSR-0412`, `DSR-0520` / `demo1234` (`DSR-0310` ถูกปิดใช้งานไว้ทดสอบ)
- **การตั้งค่าหลักสูตร**:
  - รองรับ **ผู้ลงนาม 2 คน** (`signer2`, `sig2`) แสดงคู่กันอัตโนมัติบนใบเกียรติบัตรเมื่อระบุคนที่ 2
  - รองรับ flag **`hasNet`** (`true`/`false`): หลักสูตรที่ไม่แจกเน็ต (เช่นรหัส `7302`) จะข้ามหน้ากรอกเบอร์โทรไปหน้าใบเซอร์ทันที ซ่อนการ์ดวิธีรับเน็ต และไม่ตัดสต็อกโค้ดเน็ต (แต่แถบขั้นตอนด้านบนยังคงแสดงครบทุกขั้นตามความต้องการผู้ใช้)
  - รองรับผู้ที่ **ยังไม่มี ThaID** ด้วยฟอร์มกรอกชื่อ-นามสกุล
  - Mockup หน้า ThaID ใช้พื้นสีฟ้าพร้อมกล่องสี่เหลี่ยมสีขาวเรียบตรงกลาง
- **กล้องสแกน QR**: ล็อกใช้ **กล้องหลังเท่านั้น** (`facingMode: { exact: 'environment' }`) พร้อม fallback เลือกเลนส์กล้องหลังหลักบน Android และเอาปุ่มสลับกล้องออก

---

## 3. แนวทาง UI / UX และรหัสสีสำนักงานฯ

### รหัสสีสำนักงานฯ (`frontend/src/theme/theme.js`)
| ชื่อสี | รหัสสี | การใช้งานหลัก |
| --- | --- | --- |
| **เหลืองหลัก** | `#FFF200` | ป้ายแบรนด์, เส้นคาดหัวเว็บ, ไฮไลต์หลัก, ปุ่มเด่นบนพื้นน้ำเงิน, สีหลักใน Dark Mode |
| **เหลืองรอง** | `#FFC600` | สถานะ Hover, ขอบเน้นช่องที่กำลังกรอก, ขั้นตอนที่ผ่านแล้ว, ซีรีส์รองในกราฟ |
| **น้ำเงิน** | `#0C2F53` | แถบหัวเว็บ/แบนเนอร์, สีหลักใน Light Mode, พื้นหลังการ์ดใน Dark Mode, ตัวอักษรบนพื้นเหลือง |

### หลักสไตล์ที่ตกลงกัน
- ใช้สไตล์ **Flat & Clean** เรียบคม เป็นทางการ (สีทึบ + เส้นขอบ `1px`–`2px` + คอนทราสต์สูง)
- **หลีกเลี่ยงเอฟเฟกต์ที่ดูเหมือน AI ทำเกินไป**: ไม่ใส่ `radial-gradient`, `linear-gradient` บนปุ่ม/การ์ด, เงาฟุ้ง (`box-shadow` หนา ๆ), `drop-shadow` เรืองแสง, `backdrop-filter` กระจกฝ้า หรือวงแหวน pulse วิ้ง ๆ

### ข้อควรระวังของ MUI ในโปรเจกต์นี้
1. **`theme.shape.borderRadius = 10`**: การใส่ `borderRadius: 3` หรือ `5` แบบตัวเลขใน `sx` จะถูกคูณเป็น `30px` / `50px` ทำให้ปุ่มบวมเป็นวงรี ให้ระบุเป็น px string เสมอ เช่น `'10px'`, `'12px'`, `'16px'`
2. **`<Stack>` กับ `mt: 'auto'`**: ต้องใส่ prop `useFlexGap` บน `<Stack>` ทุกครั้งที่ต้องการดันปุ่มลงชิดด้านล่างด้วย `mt: 'auto'` มิฉะนั้น margin-top ของ MUI Stack จะทับ `mt: 'auto'`

---

## 4. ความรู้เชิงลึกระบบเสียงพูด (TTS / STT / Autoplay)

### ข้อจำกัด Autoplay Policy ของเบราว์เซอร์
- **เว็บเบราว์เซอร์ทั่วไป (iOS Safari / Android Chrome / Desktop Chrome)**: บล็อกไม่ให้เว็บเล่นเสียงอัตโนมัติทันทีที่เปิดหน้าก่อนมี user gesture (แตะ/คลิก/กดปุ่ม)
- **`speechSynthesis.speak()`**: โดน Chrome บล็อก 100% ทุกครั้งก่อนมี user activation (แม้เปิดสิทธิ์ Sound ใน Site Settings ก็ยังไม่เล่น)
- **`<audio>` (ไฟล์ `.mp3`)**: เล่นอัตโนมัติได้ในบางกรณี เช่น Edge/Firefox ที่ตั้งอนุญาต Autoplay, Chrome ที่มี MEI สูง หรือเปิดด้วย `--autoplay-policy=no-user-gesture-required` (โหมด Kiosk), หรือในแอป WebView/Capacitor ที่ปิด `mediaPlaybackRequiresUserGesture`
- **ผู้พิการทางสายตา (VoiceOver / TalkBack)**: ใช้ `aria-live="assertive"` ให้ตัวอ่านหน้าจออ่านทันทีตั้งแต่เข้าเว็บได้โดยไม่ติด Autoplay Policy

### แนวปฏิบัติสำคัญใน `voiceService.js`
- **เรียก `speechSynthesis.speak()` แบบ synchronous ภายใน user gesture** — ห้ามห่อใน `setTimeout` และห้ามพูด `' '` เปล่าตอน `pointerdown` เพราะจะทำให้ `synth.pending` ค้างและเสียสิทธิ์ user gesture
- **ไม่บังคับ `localService: true`**: กำหนด `utterance.lang = 'th-TH'` ตรง ๆ เพื่อความเสถียรข้ามแพลตฟอร์ม
- **Utterance GC Guard**: เก็บ reference ของ `SpeechSynthesisUtterance` ไว้ในตัวแปรระดับโมดูล (`currentUtterance`) ป้องกัน Safari/Chrome เก็บขยะตัดเสียงกลางประโยค
- **จัดการ Error ของ `<audio>` อย่างถูกต้อง**: ห้ามเพิ่มไฟล์เข้า `missingClips` เมื่อเจอ `NotAllowedError` หรือ `AbortError`
- **ปุ่มไมโครโฟน**: กด 1 ครั้งให้พูด `"พูดได้เลยครับ"` → รอ 250ms แล้วค่อยเริ่มฟัง (กันไมค์อัดเสียงพูดของระบบเอง) และกดซ้ำเพื่อหยุดทันที
- **แปลงคำพูดภาษาไทยเป็นตัวเลข (`thaiSpeech.js`)**: `digitsOf()` รองรับเลขประสมไทย (`สิบห้า`, `ยี่สิบเจ็ด`, `เอ็ด`, `เก้าสิบสาม`) และตัวเลขอังกฤษ

---

## 5. บทเรียนจากบั๊กสำคัญที่พบและแก้ไข

| ปัญหาที่พบ | สาเหตุ | วิธีแก้ไข |
| --- | --- | --- |
| **กดปุ่มไมค์แล้วปิดเองทันทีใน 1ms** | `useVoice()` คืน object ใหม่ทุก render ทำให้ `useEffect` cleanup เรียก `voice.stopMic()` ทันทีที่ `listening` เปลี่ยนเป็น `true` | ห่อค่าที่คืนจาก `useVoice` ด้วย `useMemo` และ destructure callback คงที่ (`stopMic`) สำหรับ unmount cleanup |
| **หน้ารับใบเซอร์ไม่ดาวน์โหลดไฟล์ให้อัตโนมัติ** | `autoSavedRef.current = true` ถูกตั้งก่อน `setTimeout` ทำงาน พอดึง/บันทึก `recordCertificateClaim()` เสร็จแล้ว `db` อัปเดต `useEffect` รัน cleanup ยกเลิก timer พอรันใหม่ก็ติด `autoSavedRef === true` (รวมถึง React `<StrictMode>`) | เก็บค่าล่าสุดใน `latestRef`, ผูก dependency แค่ `[certPhase]`, และตั้ง `autoSavedRef.current = true` ภายใน callback ตอนเริ่มดาวน์โหลดจริงเท่านั้น |
| **Export PNG/PDF เพี้ยนหรือพังจาก Font CORS** | `html-to-image` อ่าน Google Fonts stylesheet ที่ไม่มี `crossorigin="anonymous"` ไม่ได้ และ `ref` อยู่ข้างใน `containerType: 'inline-size'` ทำให้หน่วย `cqw` คำนวณผิด | ใส่ `crossorigin="anonymous"` ใน `index.html`, เพิ่ม fallback `skipFonts: true`, ย้าย `ref` มาครอบกล่องที่มี `containerType: 'inline-size'`, และดาวน์โหลดผ่าน `Blob` (`URL.createObjectURL`) |
| **ปุ่มแก้ไขหลักสูตรใน Admin กดแล้วไม่เปิดฟอร์ม** | `AdminLayout.jsx` return `<Outlet />` ต่างระดับใน JSX tree เมื่อ `hideChrome` เปลี่ยน ทำให้ React unmount/remount หน้าลูกและรีเซ็ต state | คง `<Outlet />` ไว้ตำแหน่งเดิมเสมอ และซ่อนเฉพาะส่วน header/sidebar แบบ inline |
| **GitHub Pages ขึ้นหน้าขาว (`404 /src/main.jsx`)** | เสิร์ฟ `index.html` ดิบโดยไม่ผ่าน Vite build + ใช้ path แบบ absolute + `BrowserRouter` | เพิ่ม `.github/workflows/deploy.yml` build จาก `frontend/`, ใช้ `base: "./"`, `HashRouter`, `./favicon.svg`, `import.meta.env.BASE_URL` |

---

## 6. ข้อตกลงการทำงานและ Git Workflow

- **กฎ Git**: ทำงานบน branch **`dev`** ตลอด **ห้าม** สลับ/merge/push ขึ้น **`main`** โดยไม่ได้รับอนุญาตจากผู้ใช้ก่อนทุกครั้ง
- **การตรวจสอบ**: รัน `npm run lint` (0 errors) และ `npm run build` ทุกครั้งหลังแก้ไขโค้ด
- **สิ่งที่ผู้ใช้ตัดสินใจไม่เอา (ห้ามนำกลับมาใส่ซ้ำโดยไม่ขอ)**:
  - หน้าต่างป๊อปอัปถามเปิดเสียงพูดตอนเข้าเว็บ (`VoiceWelcomeDialog`)
  - ตัวบล็อกการแตะหน้าจอระหว่างระบบกำลังพูด
  - ปุ่มไมค์ตรงกลางหน้าเลือกเครือข่าย 4 มุม (`CarrierQuadrantStep`)
  - ปุ่มดาวน์โหลด PNG / NetGuide PNG เพิ่มเติมใน `CertificateStep` (คงเฉพาะปุ่มดาวน์โหลด PDF ตามที่ผู้ใช้ปรับเอง)
  - การซ่อนปุ่มขั้นตอน `เบอร์โทร` จากแถบขั้นตอนด้านบนเมื่อ `hasNet === false`
