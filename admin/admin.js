// Admin Dashboard Logic

let db = null;
let selectedUserId = null;

/**
 * Initialize admin dashboard
 */
function initAdmin() {
    db = loadDatabase();

    // Check if user is admin
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied. Admins only.');
        window.location.href = '../login.html';
        return;
    }

    // Load initial tab
    loadProducts();
}

/**
 * Switch between admin tabs
 */
function switchAdminTab(tabName, event) {
    if (event) {
        event.preventDefault();

        // Update navigation
        document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
        event.target.classList.add('active');
    }

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    const tab = document.getElementById(tabName + 'Tab');
    if (tab) {
        tab.classList.add('active');

        // Load data for the tab
        switch (tabName) {
            case 'products':
                loadProducts();
                break;
            case 'users':
                loadUsers();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'notifications':
                loadNotifications();
                break;
            case 'settings':
                loadSettings();
                break;
        }
    }
}

/**
 * Load products list
 */
function loadProducts() {
    const productsList = document.getElementById('productsList');

    if (db.products.length === 0) {
        productsList.innerHTML = '<div class="alert alert-info">Chưa có sản phẩm nào</div>';
        return;
    }

    const productsHtml = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Dịch vụ</th>
            <th>Username</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Giá gốc</th>
            <th>Còn lại</th>
            <th>Giá bán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${db.products.map(product => {
        const pricing = calculateSellingPrice(product.originalPrice, product.startDate, product.endDate);
        return `
              <tr>
                <td>${product.serviceType}</td>
                <td>${product.username}</td>
                <td>${formatDate(product.startDate)}</td>
                <td>${formatDate(product.endDate)}</td>
                <td>${formatPrice(product.originalPrice)}</td>
                <td>${pricing.remainingDays} ngày</td>
                <td>${formatPrice(pricing.sellingPrice)}</td>
                <td>
                  <span class="badge badge-${product.status === 'available' ? 'success' : 'danger'}">
                    ${product.status === 'available' ? 'Có sẵn' : 'Đã bán'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="deleteProduct('${product.id}')">
                    Xóa
                  </button>
                </td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    </div>
  `;

    productsList.innerHTML = productsHtml;
}

/**
 * Show/hide add product form
 */
function showAddProductForm() {
    document.getElementById('addProductForm').classList.remove('hidden');
}

function hideAddProductForm() {
    document.getElementById('addProductForm').classList.add('hidden');
    document.getElementById('addProductForm').querySelector('form').reset();
}

/**
 * Handle add product
 */
function handleAddProduct(event) {
    event.preventDefault();

    const newProduct = {
        id: generateId(),
        serviceType: document.getElementById('productServiceType').value,
        username: document.getElementById('productUsername').value,
        password: document.getElementById('productPassword').value,
        cookie: document.getElementById('productCookie').value,
        localStorage: document.getElementById('productLocalStorage').value || '{}',
        startDate: document.getElementById('productStartDate').value,
        endDate: document.getElementById('productEndDate').value,
        originalPrice: parseInt(document.getElementById('productOriginalPrice').value),
        status: 'available',
        createdAt: new Date().toISOString()
    };

    // Validate dates
    if (new Date(newProduct.endDate) <= new Date(newProduct.startDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
    }

    db.products.push(newProduct);
    saveDatabase(db);

    alert('Thêm sản phẩm thành công!');
    hideAddProductForm();
    loadProducts();
}

/**
 * Delete product
 */
function deleteProduct(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        return;
    }

    db.products = db.products.filter(p => p.id !== productId);
    saveDatabase(db);
    loadProducts();
}

/**
 * Load users list
 */
function loadUsers() {
    const usersList = document.getElementById('usersList');

    const usersHtml = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ví nạp</th>
            <th>Ví hoa hồng</th>
            <th>Mã Affiliate</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${db.users.map(user => `
            <tr>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td><span class="badge badge-${user.role === 'admin' ? 'danger' : 'info'}">${user.role}</span></td>
              <td>${formatPrice(user.depositWallet)}</td>
              <td>${formatPrice(user.commissionWallet)}</td>
              <td><code>${user.affiliateCode}</code></td>
              <td>${formatDate(user.createdAt)}</td>
              <td>
                ${user.role !== 'admin' ? `
                  <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="openAdjustWallet('${user.id}')">
                    Điều chỉnh ví
                  </button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

    usersList.innerHTML = usersHtml;
}

/**
 * Open adjust wallet modal
 */
function openAdjustWallet(userId) {
    selectedUserId = userId;
    document.getElementById('adjustWalletModal').classList.add('active');
}

/**
 * Close adjust wallet modal
 */
function closeAdjustWallet() {
    document.getElementById('adjustWalletModal').classList.remove('active');
    selectedUserId = null;
    document.getElementById('adjustAmount').value = '';
    document.getElementById('adjustReason').value = '';
}

/**
 * Confirm wallet adjustment
 */
function confirmAdjustWallet() {
    const walletType = document.getElementById('adjustWalletType').value;
    const amount = parseInt(document.getElementById('adjustAmount').value);
    const reason = document.getElementById('adjustReason').value;

    if (!amount || amount === 0) {
        alert('Vui lòng nhập số tiền hợp lệ!');
        return;
    }

    if (!reason.trim()) {
        alert('Vui lòng nhập lý do điều chỉnh!');
        return;
    }

    const user = db.users.find(u => u.id === selectedUserId);
    if (!user) {
        alert('Không tìm thấy người dùng!');
        return;
    }

    // Adjust wallet
    if (walletType === 'deposit') {
        user.depositWallet += amount;
        if (user.depositWallet < 0) user.depositWallet = 0;
    } else {
        user.commissionWallet += amount;
        if (user.commissionWallet < 0) user.commissionWallet = 0;
    }

    // Create transaction record
    const transaction = {
        id: generateId(),
        userId: user.id,
        type: 'admin_adjustment',
        amount: amount,
        description: `Admin: ${reason}`,
        walletType: walletType,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    db.transactions.push(transaction);
    saveDatabase(db);

    alert('Điều chỉnh ví thành công!');
    closeAdjustWallet();
    loadUsers();
}

/**
 * Clean old data
 */
function cleanOldData() {
    if (!confirm('Xóa logs và giao dịch cũ hơn 30 ngày?')) {
        return;
    }

    const deleted = cleanOldLogs(db);
    alert(`Đã xóa ${deleted} bản ghi cũ!`);
}

/**
 * Load orders list
 */
function loadOrders() {
    const ordersList = document.getElementById('ordersList');

    if (db.orders.length === 0) {
        ordersList.innerHTML = '<div class="alert alert-info">Chưa có đơn hàng nào</div>';
        return;
    }

    const ordersHtml = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Dịch vụ</th>
            <th>Ngày mua</th>
            <th>Số ngày</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          ${db.orders.map(order => {
        const user = db.users.find(u => u.id === order.userId);
        return `
              <tr>
                <td><code>${order.id.substring(0, 8)}</code></td>
                <td>${user ? user.username : 'N/A'}</td>
                <td>${order.serviceType}</td>
                <td>${formatDate(order.purchaseDate)}</td>
                <td>${order.daysRemaining} ngày</td>
                <td>${formatPrice(order.pricePaid)}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="stats-grid" style="margin-top: 2rem;">
      <div class="stat-card">
        <div class="stat-label">Tổng đơn hàng</div>
        <div class="stat-value">${db.orders.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tổng doanh thu</div>
        <div class="stat-value">${formatPrice(db.orders.reduce((sum, o) => sum + o.pricePaid, 0))}</div>
      </div>
    </div>
  `;

    ordersList.innerHTML = ordersHtml;
}

/**
 * Load notifications
 */
function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');

    if (db.notifications.length === 0) {
        notificationsList.innerHTML = '<div class="alert alert-info">Chưa có thông báo nào</div>';
        return;
    }

    const notificationsHtml = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 60%;">Nội dung</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${db.notifications.map(notif => `
            <tr>
              <td>${notif.message}</td>
              <td>
                <span class="badge badge-${notif.isActive ? 'success' : 'danger'}">
                  ${notif.isActive ? 'Đang hiện' : 'Đã ẩn'}
                </span>
              </td>
              <td>${formatDate(notif.createdAt)}</td>
              <td>
                <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="toggleNotification('${notif.id}')">
                  ${notif.isActive ? 'Ẩn' : 'Hiện'}
                </button>
                <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="deleteNotification('${notif.id}')">
                  Xóa
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

    notificationsList.innerHTML = notificationsHtml;
}

/**
 * Show add notification form
 */
function showAddNotification() {
    document.getElementById('addNotificationForm').classList.remove('hidden');
}

function hideAddNotification() {
    document.getElementById('addNotificationForm').classList.add('hidden');
    document.getElementById('notificationMessage').value = '';
}

/**
 * Handle add notification
 */
function handleAddNotification(event) {
    event.preventDefault();

    const message = document.getElementById('notificationMessage').value;

    const newNotification = {
        id: generateId(),
        message: message,
        isActive: true,
        createdAt: new Date().toISOString()
    };

    db.notifications.push(newNotification);
    saveDatabase(db);

    alert('Thêm thông báo thành công!');
    hideAddNotification();
    loadNotifications();
}

/**
 * Toggle notification active status
 */
function toggleNotification(notifId) {
    const notif = db.notifications.find(n => n.id === notifId);
    if (notif) {
        notif.isActive = !notif.isActive;
        saveDatabase(db);
        loadNotifications();
    }
}

/**
 * Delete notification
 */
function deleteNotification(notifId) {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) {
        return;
    }

    db.notifications = db.notifications.filter(n => n.id !== notifId);
    saveDatabase(db);
    loadNotifications();
}

/**
 * Load settings
 */
function loadSettings() {
    const settings = db.settings || {
        qrCodeUrl: '',
        depositInstruction: 'Chuyển khoản theo mã nội dung bên dưới',
        minDeposit: 10000,
        minWithdrawal: 50000
    };

    document.getElementById('settingsQRCodeUrl').value = settings.qrCodeUrl || '';
    document.getElementById('settingsDepositInstruction').value = settings.depositInstruction || '';
    document.getElementById('settingsMinDeposit').value = settings.minDeposit || 10000;
    document.getElementById('settingsMinWithdrawal').value = settings.minWithdrawal || 50000;
}

/**
 * Handle update settings
 */
function handleUpdateSettings(event) {
    event.preventDefault();

    db.settings = {
        qrCodeUrl: document.getElementById('settingsQRCodeUrl').value,
        depositInstruction: document.getElementById('settingsDepositInstruction').value,
        minDeposit: parseInt(document.getElementById('settingsMinDeposit').value),
        minWithdrawal: parseInt(document.getElementById('settingsMinWithdrawal').value)
    };

    saveDatabase(db);
    alert('Lưu cài đặt thành công!');
}

/**
 * Admin logout
 */
function adminLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        logoutUser();
        window.location.href = '../login.html';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initAdmin);
