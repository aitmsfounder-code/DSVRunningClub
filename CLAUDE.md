# DSV Run Together — เว็บจองเสื้อชมรมวิ่ง

## โปรเจคนี้คืออะไร

เว็บไซต์สั่งจองเสื้อวิ่งสำหรับชมรม DSV Run Together  
สมาชิกชมรมสามารถดูรูปเสื้อ เลือกแบบ แล้วกรอกฟอร์มจองผ่านเว็บได้  
เจ้าของโปรเจค (Dev) เป็นผู้ดูแลชมรมที่รวบรวมยอดสั่งจองจากสมาชิก

## Tech Stack

- **Frontend**: Static HTML/CSS/JS (ไม่มี framework, ไม่มี build step)
- **Font**: Google Fonts — Prompt
- **Backend**: Supabase (PostgreSQL, REST API, free tier)
- **Hosting target**: Netlify (free tier) หรือ GitHub Pages

## โครงสร้างไฟล์

```
เว็บ/
├── index.html              # หน้าแรก — โปรโมตเสื้อ, กำหนดการ, แกลเลอรีเสื้อ 6 แบบ, ตารางไซส์
├── order.html              # หน้าสั่งจอง — ฟอร์ม (ชื่อ, สี, แบบแขน, ไซส์, จำนวน) + preview รูปเสื้อ real-time
├── dashboard.html          # Dashboard — สรุปยอดจอง (stat cards, bar charts แยกสี/แขน/ไซส์/combo, ตารางรายการ)
├── style.css               # CSS ทั้งหมด (custom, ไม่ใช้ Tailwind)
├── app.js                  # JS กลาง — Supabase config, REST API helper, nav toggle, product filter, toast
├── favicon.svg             # Favicon (ตัว R สีส้มบนพื้นน้ำเงิน)
├── images/                 # รูปเสื้อ 6 ไฟล์ (optimized ~60KB/รูป)
│   ├── short-sleeve-navy.jpg
│   ├── short-sleeve-white.jpg
│   ├── sleeveless-navy.jpg
│   ├── sleeveless-white.jpg
│   ├── tank-top-navy.jpg
│   └── tank-top-white.jpg
├── DEPLOY-GUIDE.md         # คู่มือ deploy แบบ step-by-step
└── CLAUDE.md               # ไฟล์นี้
```

## ข้อมูลเสื้อ

- **2 สี**: น้ำเงิน (Navy), ขาว (White)
- **3 แบบแขน**: แขนสั้น (Short Sleeve), แขนกุด (Sleeveless), กล้าม (Tank Top)
- **7 ไซส์**: XS, S, M, L, XL, 2XL, 3XL
- **แบรนด์**: DSV — Global Transport and Logistics / ชมรม "Run Together"

## กำหนดการสำคัญ

| เหตุการณ์ | วันที่ |
|---|---|
| เปิดรับออเดอร์ | วันนี้ — 22 เม.ย. 2569 |
| ตัดยอดออเดอร์ | 22 เม.ย. 2569 |
| รวบรวมเงิน + สั่งผลิต | 24 เม.ย. 2569 (ก่อน 16:00) |
| คาดว่าได้รับเสื้อ | 29 เม.ย. — 7 พ.ค. 2569 |

## การเชื่อมต่อ Backend (Supabase)

ข้อมูลจองเก็บใน Supabase (PostgreSQL) ผ่าน REST API:
- **POST** `/rest/v1/orders` → บันทึกออเดอร์ใหม่
- **GET** `/rest/v1/orders` → ดึงข้อมูลออเดอร์ทั้งหมดสำหรับ Dashboard

Config ใส่ที่ `app.js`:
```js
const SUPABASE_URL = ''; // ← ใส่ Supabase Project URL
const SUPABASE_ANON_KEY = ''; // ← ใส่ Supabase anon/public key
```

ถ้ายังไม่ได้ตั้ง Supabase → ฟอร์มจะ fallback เก็บใน localStorage

### Supabase Table Schema

```sql
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sleeve_type TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS Policies: Allow public read + insert

## สิ่งที่ยังต้องทำ (TODO)

1. **ตั้ง Supabase project + run SQL** → ได้ URL + anon key มาใส่ใน `app.js`
2. **Deploy เว็บขึ้น Netlify หรือ GitHub Pages** — push โค้ดขึ้น GitHub repo แล้ว deploy
3. **(อนาคต)** ขยายเป็นเว็บชมรมวิ่งเต็มรูปแบบ — เพิ่มหน้าข่าวสาร, กิจกรรม, ประชาสัมพันธ์

## Design System

- **สี Navy**: `#1a2744` (primary)
- **สี Orange**: `#e8832a` (accent)
- **สี Gold**: `#f0c040` (accent secondary)
- **Font**: Prompt (Google Fonts)
- **Border radius**: 12px (cards), 8px (inputs), 50px (buttons/badges)
- **Design language**: Clean, modern, mobile-first responsive

## หมายเหตุสำหรับ Claude Code

- ไม่มี build step — แก้ไฟล์ HTML/CSS/JS ได้ตรงๆ
- Dashboard เปิดให้ทุกคนดูได้ ไม่มี auth
- เจ้าของโปรเจค (Dev) ใช้ email: aitms.founder@gmail.com
- ภาษาในเว็บเป็นภาษาไทย
