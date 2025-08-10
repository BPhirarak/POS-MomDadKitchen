# ระบบหลังบ้านร้านอาหาร "ครัวแม่กับป๋า"

ระบบจัดการหลังบ้านสำหรับร้านอาหารที่ขายอาหารเพื่อสุขภาพ สร้างด้วย React + Vite + Tailwind CSS

## ฟีเจอร์หลัก

- 🍽️ **จัดการเมนูอาหาร** - เพิ่ม แก้ไข ลบรายการอาหาร พร้อมรูปภาพ
- 🛒 **ระบบตะกร้าสินค้า** - เลือกอาหาร คำนวณราคา จัดการจำนวน
- 📋 **ระบบออร์เดอร์** - สร้างออร์เดอร์ พิมพ์ใบเสร็จ เลขคิวอัตโนมัติ
- 📊 **ประวัติออร์เดอร์** - เก็บบันทึกการขายทั้งหมด
- 📱 **Responsive Design** - ใช้งานได้ทั้ง Desktop และ Tablet

## หมวดหมู่อาหาร

1. **สลัดและอาหารเพื่อสุขภาพ** - สลัดผักใสใส, สลัดไก่ย่าง, สลัดปลาแซลมอน
2. **หมี่และเส้น** - หมี่คลุกไก่ฉีก, หมี่คลุกหมูย่าง, เส้นเล็กต้มยำ
3. **เครื่องดื่มเพื่อสุขภาพ** - น้ำสับปะรดคั้นสด, สมูทตี้มะม่วง, น้ำดีท็อกซ์
4. **ขนมและของหวาน** - เค้กกล้วยหอม, พุดดิ้งเชีย, โยเกิร์ตผลไม้

## การติดตั้ง

### ข้อกำหนดระบบ
- Node.js 16+ 
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **Clone หรือ download project**
```bash
# หากใช้ git
git clone <repository-url>
cd restaurant-pos-system

# หรือ extract zip file แล้ว cd เข้าไปในโฟลเดอร์
```

2. **ติดตั้ง dependencies**
```bash
npm install
# หรือ
yarn install
```

3. **รันโปรเจค**
```bash
npm run dev
# หรือ
yarn dev
```

4. **เปิดเบราว์เซอร์**
```
http://localhost:3000
```

## การใช้งาน

### 1. เมนูหลัก
- คลิกที่หมวดหมู่อาหารเพื่อดูรายการอาหารในหมวดนั้น
- คลิกที่อาหารเพื่อเพิ่มลงตะกร้า

### 2. จัดการเมนู
- เพิ่มรายการอาหารใหม่ พร้อมรูปภาพ
- แก้ไข/ลบรายการที่มีอยู่
- จัดกลุ่มตามหมวดหมู่

### 3. ตะกร้าสินค้า
- ดูรายการที่เลือก
- ปรับจำนวน เพิ่ม/ลด
- ลบรายการ
- ดูราคารวม

### 4. ออร์เดอร์
- พิมพ์ใบเสร็จ (แสดงใน Console)
- สั่งอาหาร (บันทึกเข้าประวัติ)
- ล้างตะกร้า

## โครงสร้างโปรเจค

```
restaurant-pos-system/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # Project documentation
```

## การพัฒนาต่อ

### เพิ่มฟีเจอร์ใหม่
- 💾 บันทึกข้อมูลลง Local Storage หรือ Database
- 🔐 ระบบ Login/Authentication
- 📈 รายงานยอดขาย/สถิติ
- 🖨️ การพิมพ์ใบเสร็จจริง
- 💳 ระบบชำระเงิน
- 📱 Mobile App version

### การปรับแต่ง
- เปลี่ยนสีธีม ใน `categoryColors`
- เพิ่มหมวดหมู่อาหาร ใน `categories` array
- ปรับ layout responsive ใน Tailwind classes

## เทคโนโลยีที่ใช้

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - CSS Framework
- **Lucide React** - Icon Library

## การสนับสนุน

หากมีปัญหาหรือข้อเสนอแนะ สามารถ:
- เปิด Issue ใน GitHub
- ติดต่อผู้พัฒนา
- ส่ง Pull Request เพื่อปรับปรุง

## License

MIT License - ใช้งานได้อย่างอิสระ