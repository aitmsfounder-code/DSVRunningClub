# คู่มือ Deploy เว็บจองเสื้อ DSV Run Together

## โครงสร้างไฟล์
```
เว็บ/
├── index.html          ← หน้าแรก (โปรโมตเสื้อ)
├── order.html          ← หน้าสั่งจอง
├── dashboard.html      ← หน้า Dashboard สรุปยอด
├── style.css           ← CSS ทั้งหมด
├── app.js              ← JavaScript หลัก (ใส่ URL Apps Script ที่นี่)
├── google-apps-script.js ← โค้ดสำหรับ Google Apps Script (ไม่ต้อง upload ขึ้นเว็บ)
└── images/             ← รูปเสื้อ 6 แบบ
```

---

## ขั้นตอนที่ 1: ตั้งค่า Google Sheets (เก็บข้อมูลจอง)

1. ไปที่ **Google Sheets** → สร้าง Spreadsheet ใหม่
2. ตั้งชื่อ Sheet แรก (tab ด้านล่าง) ว่า **`Orders`**
3. ใส่ header ในแถวที่ 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | ชื่อ | สี | แบบแขน | ไซส์ | จำนวน |

4. ไปที่เมนู **Extensions → Apps Script**
5. ลบโค้ดเก่าทั้งหมด → วางโค้ดจากไฟล์ `google-apps-script.js`
6. กด **Deploy → New deployment**
7. คลิก icon เฟืองเล็กๆ → เลือก **Web app**
8. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. กด **Deploy** → คัดลอก URL ที่ได้
10. เปิดไฟล์ `app.js` → ใส่ URL ในบรรทัด:
    ```js
    const APPS_SCRIPT_URL = 'URL_ที่ได้จาก_STEP_9';
    ```

---

## ขั้นตอนที่ 2: Deploy เว็บ (เลือก 1 วิธี)

### แนะนำ: Netlify (ง่ายที่สุด ฟรี)

1. ไปที่ **[netlify.com](https://netlify.com)** → สมัคร/ล็อกอิน
2. ลากโฟลเดอร์ `เว็บ` ทั้งโฟลเดอร์ไปวางที่หน้า **Sites**
   (⚠️ ไม่ต้องรวมไฟล์ `google-apps-script.js` และโฟลเดอร์ `แบบเสื้อ`)
3. Netlify จะ deploy ให้อัตโนมัติ ได้ URL เช่น `https://xxx.netlify.app`
4. (ไม่บังคับ) ตั้ง custom domain ถ้ามี

### ทางเลือก: GitHub Pages (ฟรี)

1. สร้าง repo ใหม่ใน GitHub
2. Upload ไฟล์ทั้งหมด (ยกเว้น `google-apps-script.js`)
3. ไปที่ **Settings → Pages** → เลือก Branch: main → Save
4. ได้ URL เช่น `https://username.github.io/repo-name`

### ทางเลือก: Vercel (ฟรี)

1. ไปที่ **[vercel.com](https://vercel.com)** → สมัคร/ล็อกอิน
2. Import project จาก GitHub หรือ upload โฟลเดอร์
3. ได้ URL อัตโนมัติ

---

## ขั้นตอนที่ 3: ทดสอบ

1. เปิดเว็บ → ทดลองสั่งจอง 2-3 รายการ
2. ตรวจสอบว่าข้อมูลเข้า Google Sheets
3. เปิดหน้า Dashboard → ดูว่ายอดแสดงถูกต้อง
4. ทดสอบบน มือถือ ด้วย (responsive design)

---

## หมายเหตุ
- **ข้อมูลจะเก็บใน Google Sheets** ของคุณ — สามารถเปิดดูและจัดการได้ตลอด
- **Dashboard เปิดดูได้ทุกคน** ไม่ต้อง login
- ถ้ายังไม่ได้ตั้ง Google Sheets ข้อมูลจะเก็บใน localStorage ของ browser ชั่วคราว
- รูปเสื้อขนาดใหญ่พอสมควร (~2MB/รูป) แนะนำย่อขนาดก่อน upload ถ้าต้องการ
