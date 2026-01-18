# 🚀 Quick Deployment Guide

## TÓM TẮT: 3 BƯỚC DEPLOY

### 📁 1. GitHub
```bash
cd C:\Users\Administrator\.gemini\antigravity\scratch\account-shop
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/account-shop.git
git push -u origin main
```

### 🔥 2. Firebase Setup

1. Tạo project: https://console.firebase.google.com/
2. Enable Firestore Database (Production mode)
3. Lấy config từ Project Settings > Your apps > Web
4. Mở `js/firebase-config.js` và thay thế config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR-PROJECT.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};
```

5. Firestore Rules (tạm thời cho test):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### ☁️ 3. Vercel Deploy

1. Truy cập: https://vercel.com/
2. Import GitHub repository
3. Framework Preset: **Other**
4. Click **Deploy**
5. Đợi ~1 phút → Xong!

---

## 🧪 TEST LOCAL (KHÔNG CẦN FIREBASE)

Nếu muốn test trước khi deploy:

1. Đổi tên file:
   - `database-firebase.js` → `database-firebase.js.backup`
   - Trong `index.html`, `login.html`, `admin/index.html`:
     ```html
     <!-- Thay vì -->
     <script src="js/firebase-config.js"></script>
     <script src="js/database-firebase.js"></script>
     
     <!-- Dùng -->
     <script src="js/database.js"></script>
     ```

2. Chạy local server:
   ```bash
   # Cách 1: Python
   python -m http.server 8000
   
   # Cách 2: VS Code - Live Server extension
   # Cách 3: Mở trực tiếp login.html
   ```

3. Mở trình duyệt: `http://localhost:8000/login.html`

---

## 📋 CHECKLIST

- [ ] Tạo Firebase project
- [ ] Enable Firestore Database
- [ ] Cấu hình `firebase-config.js`
- [ ] Push code lên GitHub
- [ ] Deploy Vercel từ GitHub repo
- [ ] Test đăng nhập/đăng ký
- [ ] Test mua hàng
- [ ] Test affiliate link

---

## 🐛 TROUBLESHOOTING

### Firebase không khởi tạo
- Kiểm tra Console (F12) có lỗi không
- Xác nhận `firebase-config.js` đã được thay config

### Không thể đăng nhập
- Check Firestore Rules đã allow read/write chưa
- Xem Firebase Console > Firestore có data không

### Vercel 404
- Xác nhận `vercel.json` tồn tại
- Check build logs trong Vercel Dashboard

---

**Made with ❤️ - Vietnamese Account Shop System**
