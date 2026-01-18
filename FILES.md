# 📦 Account Shop - Danh sách File

## 🗂️ Cấu trúc thư mục

```
account-shop/
├── 📄 index.html                 # Trang chủ user
├── 📄 login.html                 # Trang đăng nhập/đăng ký
├── 📄 README.md                  # Hướng dẫn đầy đủ
├── 📄 DEPLOY.md                  # Hướng dẫn deploy nhanh
├── 📄 package.json               # NPM package config
├── 📄 vercel.json                # Vercel deployment config
├── 📄 .gitignore                 # Git ignore rules
│
├── 📁 css/
│   └── 📄 styles.css             # Dark theme styling (100+ lines)
│
├── 📁 js/
│   ├── 📄 firebase-config.js     # 🔥 Firebase configuration
│   ├── 📄 database-firebase.js   # 🔥 Firestore database layer (300+ lines)
│   ├── 📄 database.js            # LocalStorage version (backup)
│   ├── 📄 pricing.js             # Anti-loss pricing engine
│   ├── 📄 affiliate.js           # 30% commission system
│   └── 📄 app.js                 # Main application logic (500+ lines)
│
└── 📁 admin/
    ├── 📄 index.html             # Admin dashboard
    └── 📄 admin.js               # Admin management logic (400+ lines)
```

---

## 📋 Danh sách file cần upload

### Root Directory (7 files)
1. ✅ `index.html` - 146 lines
2. ✅ `login.html` - 195 lines
3. ✅ `README.md` - 342 lines
4. ✅ `DEPLOY.md` - 89 lines
5. ✅ `package.json` - 14 lines
6. ✅ `vercel.json` - 17 lines
7. ✅ `.gitignore` - 24 lines

### css/ (1 file)
8. ✅ `css/styles.css` - 650 lines

### js/ (6 files)
9. ✅ `js/firebase-config.js` - 50 lines
10. ✅ `js/database-firebase.js` - 318 lines
11. ✅ `js/database.js` - 188 lines (backup - local testing)
12. ✅ `js/pricing.js` - 79 lines
13. ✅ `js/affiliate.js` - 220 lines
14. ✅ `js/app.js` - 545 lines

### admin/ (2 files)
15. ✅ `admin/index.html` - 264 lines
16. ✅ `admin/admin.js` - 434 lines

---

## 🎯 Tổng cộng: 16 files

**Kích thước**: ~150KB (uncompressed)

---

## 🚀 Hướng dẫn upload

### Cách 1: Upload ZIP lên GitHub
```bash
# Extract ZIP
# Upload từng file theo cấu trúc thư mục
```

### Cách 2: Clone template trống và copy files
```bash
git clone <your-repo>
# Copy tất cả files vào
git add .
git commit -m "Initial commit"
git push
```

### Cách 3: GitHub Web Interface
1. Tạo repository mới
2. Click "uploading an existing file"
3. Kéo thả file ZIP hoặc chọn từng file
4. Commit changes

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Trước khi deploy:
1. **Thay Firebase config** trong `js/firebase-config.js`
2. **Enable Firestore** trong Firebase Console
3. **Set Firestore Rules** (xem README.md)

### Files quan trọng nhất:
- 🔥 `js/firebase-config.js` - PHẢI thay config
- 📄 `vercel.json` - Config cho Vercel
- 📄 `.gitignore` - Bảo vệ files nhạy cảm

---

## 🔄 Workflow deploy

1. **Extract ZIP** → `account-shop/`
2. **Thay Firebase config** trong `js/firebase-config.js`
3. **Push lên GitHub**
4. **Import vào Vercel**
5. **Test website**

---

**File ZIP location**: `C:\Users\Administrator\.gemini\antigravity\scratch\account-shop.zip`
