# NIGHT MARKET TYCOON

เกมบริหารตลาดกลางคืน 2.5D Isometric สำหรับ Android (Landscape) สร้างด้วย Phaser + Capacitor

## เริ่มทดสอบบนเครื่องพัฒนา
1. ติดตั้ง Node.js 20 และ Java 17
2. `npm install`
3. `npm run dev` สำหรับเปิดทดสอบในเบราว์เซอร์
4. `npm run build`
5. `npx cap add android` (ทำครั้งแรกเท่านั้น)
6. `npx cap sync android`
7. เปิด Android Studio หรือใช้ GitHub Actions สร้าง APK

## สร้างด้วย GitHub Actions จากมือถือ
1. สร้าง repository ชื่อ `NIGHT-MARKET-TYCOON`
2. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดใน ZIP นี้ไปที่ root ของ repository (อย่าอัปโหลด ZIP ซ้อน)
3. เปิดแท็บ Actions และอนุญาต workflow หาก GitHub ขอ
4. เลือก `Night Market Tycoon Android Build` > Run workflow
5. ดาวน์โหลด artifact `NIGHT-MARKET-TYCOON-Android`

## สถานะฟีเจอร์
- เกมต้นแบบ: ร้านค้า, เงิน, อัปเกรด, ภารกิจ, รายได้ออฟไลน์
- Save ในเครื่อง: ทำงานได้
- Cloud Save: โค้ดเชื่อม Firebase เตรียมไว้ แต่ยังต้องใส่ Firebase config และตั้ง Security Rules
- Rewarded Ads: โค้ดเตรียมไว้ ต้องสร้าง AdMob App/Ad Unit และใส่ ID จริง
- In-app purchases: ใช้ RevenueCat เชื่อม Google Play Billing ต้องสร้าง products ใน Play Console และ RevenueCat, ตั้ง API key และทดสอบผ่าน Internal testing
- Workflow สร้าง debug APK และ unsigned AAB; ก่อนเผยแพร่ต้องตั้ง signing key และ secrets ให้ครบ

## ตั้งค่า Cloud
แก้ `src/config.js` ใส่ `FIREBASE_CONFIG` จาก Firebase project แล้วเปิด Anonymous Authentication และ Firestore
ตั้ง Firestore Rules ให้ผู้เล่นอ่าน/เขียนได้เฉพาะ document ที่ `request.auth.uid == userId` (แนะนำให้เปลี่ยน path เป็น users/{uid} ก่อน production) ห้ามเปิด Firestore แบบ public read/write

## ตั้งค่าโฆษณา
เริ่มทดสอบด้วย test ads เท่านั้น ตั้ง `ADMOB_TEST_MODE = true` และใส่ Rewarded Ad Unit ID สำหรับ Android เมื่อสร้างแอปใน AdMob แล้ว ห้ามคลิกโฆษณาจริงของตัวเอง

## ตั้งค่าการเติมเงิน
- สร้างสินค้า `nmt_starter_pack`, `nmt_gems_100`, `nmt_gems_300`, `nmt_vip_30` ใน Google Play Console
- ตั้ง RevenueCat Android app และ Google Play service credentials
- ใส่ `REVENUECAT_ANDROID_API_KEY` ใน `src/config.js`
- ต้อง implement การมอบสินค้า/entitlement หลังยืนยันธุรกรรมและ restore purchases ก่อน production

## หมายเหตุสำคัญ
โครงการนี้เป็น MVP ที่เริ่มเล่นและ build ได้ ไม่ใช่รุ่นพร้อมรับเงินจริงทันที ระบบ Cloud/Ads/Billing ต้องตั้งค่าบัญชีและทดสอบธุรกรรมจริงใน sandbox/internal track ก่อนเปิดขาย
