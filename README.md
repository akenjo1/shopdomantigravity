# 💎 Account Shop - Hệ thống bán tài khoản Premium

Hệ thống bán tài khoản với cơ chế tính giá tự động và hoa hồng affiliate 30%.

## 🚀 Demo & Deploy

- **GitHub**: [Tạo repository mới](https://github.com/new)
- **Firebase**: [Console](https://console.firebase.google.com/)
- **Vercel**: [Dashboard](https://vercel.com/dashboard)

---

## 📋 Tính năng chính

### ✅ Cơ chế "Chống lỗ"
- Tính giá tự động dựa trên số ngày còn lại
- Bắt buộc mua trọn gói số ngày remaining
- Ngăn chặn exploit session/cookie

### 💰 Hệ thống Affiliate 30%
- 2 ví riêng biệt: Ví nạp & Ví hoa hồng
- Hoa hồng 30% trên mỗi đơn hàng
- Rút tiền về bank/thẻ hoặc chuyển đổi

### 🎨 Giao diện hiện đại
- Dark theme (CapCut/Youtube style)
- Mobile-first responsive
- Smooth animations

### 🔧 Admin Dashboard
- Quản lý sản phẩm (CRUD)
- Quản lý người dùng
- Điều chỉnh ví thủ công
- Hệ thống thông báo

---

## 🛠️ Hướng dẫn Setup

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Thêm dự án"
3. Đặt tên project (ví dụ: `account-shop`)
4. Tắt Google Analytics (không cần thiết)
5. Click "Create project"

### Bước 2: Cấu hình Firestore Database

1. Trong Firebase Console, chọn **Firestore Database**
2. Click "Create database"
3. Chọn **Production mode**
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click "Enable"

**Cấu hình Rules**: 
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if true; // CHỈ ĐỂ TEST - Production cần rules chặt chẽ hơn
    }
  }
}
```

### Bước 3: Lấy Firebase Config

1. Trong Firebase Console, click vào ⚙️ (Settings) > Project Settings
2. Scroll xuống phần "Your apps"
3. Click vào icon `</>` (Web)
4. Đặt tên app (ví dụ: `account-shop-web`)
5. Click "Register app"
6. Copy đoạn config có dạng:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

7. **Mở file** `js/firebase-config.js` và thay thế config

### Bước 4: Push lên GitHub

```bash
# Mở terminal tại thư mục project
cd C:\Users\Administrator\.gemini\antigravity\scratch\account-shop

# Khởi tạo Git repository
git init

# Add tất cả files
git add .

# Commit lần đầu
git commit -m "Initial commit - Account Shop System"

# Tạo repository mới trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/account-shop.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

### Bước 5: Deploy lên Vercel

#### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import GitHub repository `account-shop`
4. **Framework Preset**: Chọn "Other" (static site)
5. Click "Deploy"
6. Đợi ~1 phút để deploy

#### Cách 2: Qua Vercel CLI

```bash
# Cài đặt Vercel CLI (cần Node.js)
npm install -g vercel

# Login vào Vercel
vercel login

# Deploy project
vercel

# Deploy production
vercel --prod
```

### Bước 6: Kiểm tra

1. Mở URL Vercel (ví dụ: `https://account-shop.vercel.app`)
2. Đăng ký tài khoản mới hoặc login admin:
   - Username: `admin`
   - Password: `admin123`
3. Kiểm tra Firebase Console > Firestore để xem dữ liệu

---

## 📁 Cấu trúc Project

```
account-shop/
├── index.html                 # Trang chủ user
├── login.html                 # Đăng nhập/đăng ký
├── package.json               # NPM config
├── vercel.json                # Vercel deploy config
├── .gitignore                 # Git ignore rules
├── css/
│   └── styles.css             # Dark theme styling
├── js/
│   ├── firebase-config.js     # 🔥 Firebase configuration
│   ├── database-firebase.js   # 🔥 Firestore database layer
│   ├── pricing.js             # Pricing engine
│   ├── affiliate.js           # Affiliate system
│   └── app.js                 # Main app logic
└── admin/
    ├── index.html             # Admin dashboard
    └── admin.js               # Admin logic
```

---

## 🔐 Tài khoản Demo

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Sản phẩm mẫu
Hệ thống tự động tạo 3 sản phẩm demo:
- CapCut Pro (347 ngày)
- Youtube Premium (173 ngày)
- Netflix Premium (149 ngày)

---

## 🔧 Cấu hình nâng cao

### Thay đổi domain Vercel

1. Trong Vercel Dashboard > Project Settings
2. Chọn "Domains"
3. Add custom domain của bạn
4. Cấu hình DNS theo hướng dẫn

### Cấu hình Firebase Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - user can only read their own
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Admin only
    match /notifications/{notifId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Environment Variables (Vercel)

Nếu muốn ẩn Firebase config:

1. Tạo file `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
...
```

2. Add vào Vercel > Settings > Environment Variables

---

## 📝 Cập nhật code

### Sau khi thay đổi code:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel sẽ tự động deploy lại sau vài giây.

---

## 🐛 Troubleshooting

### Lỗi: Firebase not initialized

**Nguyên nhân**: Chưa config Firebase đúng

**Giải pháp**: 
1. Kiểm tra `js/firebase-config.js` đã thay config chưa
2. Mở Console (F12) xem lỗi chi tiết

### Lỗi: Permission denied (Firestore)

**Nguyên nhân**: Security Rules chặn

**Giải pháp**: 
1. Firebase Console > Firestore > Rules
2. Tạm thời set `allow read, write: if true;` (chỉ để test)

### Vercel deployment failed

**Nguyên nhân**: Có thể do file config sai

**Giải pháp**:
1. Kiểm tra `vercel.json` syntax
2. Xem logs tại Vercel Dashboard > Deployments > View Logs

---

## 📱 Screenshots

### User Interface
- Trang chủ với product grid
- Modal mua hàng với pricing chi tiết
- Sidebar navigation (mobile)
- Affiliate dashboard

### Admin Dashboard
- Quản lý sản phẩm
- Quản lý user và ví
- Thống kê đơn hàng

---

## 📄 License

MIT License - Free to use

---

## 🤝 Support

Nếu cần hỗ trợ:
1. Check Firebase Console > Firestore có data chưa
2. Check browser Console (F12) có lỗi gì không
3. Verify Vercel deployment thành công chưa

---

## 🎯 TODO (Tính năng tương lai)

- [ ] Tích hợp VietQR API cho auto-deposit
- [ ] Email verification khi đăng ký
- [ ] Firebase Authentication thay session
- [ ] Upload ảnh QR lên Firebase Storage
- [ ] Real-time updates với Firestore snapshots
- [ ] PWA support (offline mode)

---

**Made with ❤️ for Vietnamese market**
