# Database Migration Guide

## ขั้นตอนการแก้ไขโครงสร้างฐานข้อมูล

### 1. ติดตั้ง dependencies
```bash
npm install
```

### 2. รัน Database Migration Script
ก่อนอื่นต้องแก้ไขโครงสร้างตารางใน Supabase:

1. เข้าไปที่ Supabase Dashboard
2. ไปที่ SQL Editor
3. รัน script ใน `database_migration.sql`

**คำเตือน**: Script นี้จะลบตาราง `menu_items` เดิม และสร้างใหม่ ต้องสำรองข้อมูลก่อนถ้าจำเป็น

### 3. Import ข้อมูลจาก CSV Files
หลังจากแก้ไขโครงสร้างแล้ว ให้ import ข้อมูลจาก CSV files:

```bash
npm run import-data
```

**หมายเหตุ**: ต้องตั้งค่า environment variables ใน `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. โครงสร้างตารางใหม่

#### ตาราง menu_items:
- `id` - Primary key
- `sku` - รหัสสินค้า (unique)
- `name` - ชื่อเมนู
- `category` - หมวดหมู่
- `description` - คำอธิบาย
- `price_organic` - ราคาขาย
- `cost` - ต้นทุน
- `in_stock_organic` - จำนวนในสต็อก
- และฟิลด์อื่นๆ ตาม FoodMenuMaster.csv

#### ตาราง customer_master:
- `id` - Primary key
- `customer_id` - รหัสลูกค้า (unique)
- `customer_name` - ชื่อลูกค้า
- `email` - อีเมล
- `phone` - เบอร์โทร
- `points_balance` - คะแนนสะสม
- และฟิลด์อื่นๆ ตาม CustomerMaster.csv

### 5. การเปลี่ยนแปลงใน React App
- เปลี่ยนจาก `item.price` เป็น `item.price_organic`
- เพิ่มการจัดการฟิลด์ใหม่ทั้งหมด
- รองรับโครงสร้างข้อมูลใหม่

### 6. ทดสอบระบบ
หลังจาก migration แล้ว:
1. เปิดแอป: `npm run dev`
2. ทดสอบการแสดงเมนู
3. ทดสอบการสั่งซื้อ
4. ทดสอบการพิมพ์ใบเสร็จ
5. ทดสอบรายงานยอดขาย

### ไฟล์ที่เกี่ยวข้อง:
- `database_migration.sql` - Script สำหรับแก้ไขโครงสร้างตาราง
- `import_data.js` - Script สำหรับ import ข้อมูลจาก CSV
- `FoodMenuMaster.csv` - ข้อมูลเมนูอาหาร
- `CustomerMaster.csv` - ข้อมูลลูกค้า

### หมายเหตุสำคัญ:
- ข้อมูลเดิมในตาราง `menu_items` จะหายไป
- ต้องมีไฟล์ CSV ในโฟลเดอร์รูทของโปรเจ็กต์
- ต้องตั้งค่า Supabase credentials ให้ถูกต้อง