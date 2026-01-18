// Main Application Logic

let currentProduct = null;
let db = null;

// Icon mapping for different services
const SERVICE_ICONS = {
    'CapCut Pro': '🎬',
    'Youtube Premium': '▶️',
    'Netflix Premium': '🎥',
    'Spotify Premium': '🎵',
    'Canva Pro': '🎨',
    'Adobe Creative': '🖼️',
    'Default': '💎'
};

/**
 * Initialize the application
 */
function initApp() {
    db = loadDatabase();

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update wallet display
    updateWalletDisplay();

    // Update sidebar user name
    document.getElementById('sidebarUserName').textContent = currentUser.username;

    // Load products
    loadProducts();

    // Check for referral code in URL
    const refCode = getReferralCodeFromURL();
    if (refCode) {
        storeReferralCode(refCode);
    }

    // Show notification if active
    showActiveNotification();
}

/**
 * Update wallet display in header
 */
function updateWalletDisplay() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Get fresh user data from database
    const freshUser = db.users.find(u => u.id === currentUser.id);
    if (freshUser) {
        // Update session
        const { password, ...userWithoutPassword } = freshUser;
        setCurrentUser(userWithoutPassword);

        const walletHtml = `
      <div class="wallet-item">
        <span class="wallet-label">Ví nạp</span>
        <span class="wallet-amount wallet-deposit">${formatPrice(freshUser.depositWallet)}</span>
      </div>
      <div class="wallet-item">
        <span class="wallet-label">Ví hoa hồng</span>
        <span class="wallet-amount wallet-commission">${formatPrice(freshUser.commissionWallet)}</span>
      </div>
    `;
        document.getElementById('walletDisplay').innerHTML = walletHtml;
    }
}

/**
 * Load and display products
 */
function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    const availableProducts = db.products.filter(p => p.status === 'available');

    if (availableProducts.length === 0) {
        productGrid.innerHTML = '<div class="alert alert-info">Hiện chưa có sản phẩm nào</div>';
        return;
    }

    productGrid.innerHTML = availableProducts.map(product => {
        const pricing = calculateSellingPrice(product.originalPrice, product.startDate, product.endDate);

        if (pricing.isExpired) {
            return ''; // Don't show expired products
        }

        const icon = SERVICE_ICONS[product.serviceType] || SERVICE_ICONS['Default'];

        return `
      <div class="product-card" onclick="selectProduct('${product.id}')">
        <div class="product-header">
          <div class="product-icon">${icon}</div>
          <div class="product-name">${product.serviceType}</div>
        </div>
        <div class="product-info">
          <div class="product-days">Còn ${pricing.remainingDays} ngày</div>
          <div>
            <span class="product-price">${formatPrice(pricing.sellingPrice)}</span>
            <span class="product-original-price">${formatPrice(product.originalPrice)}</span>
          </div>
        </div>
      </div>
    `;
    }).join('');
}

/**
 * Select product for purchase
 */
function selectProduct(productId) {
    currentProduct = db.products.find(p => p.id === productId);
    if (!currentProduct) return;

    const pricing = calculateSellingPrice(
        currentProduct.originalPrice,
        currentProduct.startDate,
        currentProduct.endDate
    );

    const currentUser = getCurrentUser();
    const sufficientBalance = currentUser.depositWallet >= pricing.sellingPrice;

    const detailsHtml = `
    <div class="product-header" style="margin-bottom: 1.5rem;">
      <div class="product-icon">${SERVICE_ICONS[currentProduct.serviceType] || SERVICE_ICONS['Default']}</div>
      <div>
        <div class="product-name">${currentProduct.serviceType}</div>
        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
          ${formatDate(currentProduct.startDate)} - ${formatDate(currentProduct.endDate)}
        </div>
      </div>
    </div>
    
    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: var(--text-secondary);">Số ngày còn lại:</span>
        <span style="font-weight: 600;">${pricing.remainingDays} ngày</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: var(--text-secondary);">Giá mỗi ngày:</span>
        <span style="font-weight: 600;">${formatPrice(pricing.dailyPrice)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
        <span style="color: var(--text-secondary); font-weight: 600;">Tổng thanh toán:</span>
        <span style="font-size: 1.5rem; font-weight: 700; color: var(--accent-green);">${formatPrice(pricing.sellingPrice)}</span>
      </div>
    </div>
    
    ${!sufficientBalance ? `
      <div class="alert alert-error">
        ⚠️ Số dư không đủ. Vui lòng nạp thêm ${formatPrice(pricing.sellingPrice - currentUser.depositWallet)}
      </div>
    ` : ''}
    
    <div class="alert alert-info">
      ℹ️ Bạn phải mua trọn gói ${pricing.remainingDays} ngày còn lại để đảm bảo quyền lợi
    </div>
  `;

    document.getElementById('purchaseDetails').innerHTML = detailsHtml;
    document.getElementById('purchaseModal').classList.add('active');
}

/**
 * Confirm purchase
 */
function confirmPurchase() {
    if (!currentProduct) return;

    const currentUser = getCurrentUser();
    const pricing = calculateSellingPrice(
        currentProduct.originalPrice,
        currentProduct.startDate,
        currentProduct.endDate
    );

    // Check balance
    const user = db.users.find(u => u.id === currentUser.id);
    if (user.depositWallet < pricing.sellingPrice) {
        alert('Số dư không đủ! Vui lòng nạp thêm tiền.');
        return;
    }

    // Deduct from deposit wallet
    user.depositWallet -= pricing.sellingPrice;

    // Create order
    const order = {
        id: generateId(),
        userId: user.id,
        productId: currentProduct.id,
        serviceType: currentProduct.serviceType,
        username: currentProduct.username,
        password: currentProduct.password,
        cookie: currentProduct.cookie,
        localStorage: currentProduct.localStorage,
        purchaseDate: new Date().toISOString(),
        daysRemaining: pricing.remainingDays,
        pricePaid: pricing.sellingPrice,
        endDate: currentProduct.endDate
    };

    db.orders.push(order);

    // Mark product as sold
    currentProduct.status = 'sold';
    currentProduct.soldTo = user.id;
    currentProduct.soldAt = new Date().toISOString();

    // Create transaction record
    const transaction = {
        id: generateId(),
        userId: user.id,
        type: 'purchase',
        amount: -pricing.sellingPrice,
        description: `Mua ${currentProduct.serviceType}`,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    db.transactions.push(transaction);

    // Check for referral code and process commission
    const refCode = getStoredReferralCode();
    if (refCode) {
        const result = trackAffiliatePurchase(refCode, pricing.sellingPrice, db);
        if (result.success) {
            clearReferralCode(); // Clear after successful tracking
        }
    }

    // Save database
    saveDatabase(db);

    // Update session user
    const { password, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);

    // Close modal and show order details
    closePurchaseModal();

    // Show success and order details
    showOrderDetails(order.id);

    // Reload products and wallet
    loadProducts();
    updateWalletDisplay();
}

/**
 * Show order details after purchase
 */
function showOrderDetails(orderId) {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return;

    const detailsHtml = `
    <div class="alert alert-success">
      ✅ Mua hàng thành công! Dưới đây là thông tin tài khoản của bạn:
    </div>
    
    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
      <h4 style="margin-bottom: 1rem; color: var(--accent-purple);">${order.serviceType}</h4>
      
      <div class="form-group">
        <label class="form-label">Username</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" class="form-input" value="${order.username}" readonly id="orderUsername">
          <button class="copy-btn" onclick="copyToClipboard('orderUsername')">📋</button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Password</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" class="form-input" value="${order.password}" readonly id="orderPassword">
          <button class="copy-btn" onclick="copyToClipboard('orderPassword')">📋</button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Cookie</label>
        <textarea class="form-textarea" readonly id="orderCookie">${order.cookie}</textarea>
        <button class="copy-btn btn-full" onclick="copyToClipboard('orderCookie')" style="margin-top: 0.5rem;">📋 Sao chép Cookie</button>
      </div>
      
      <div class="form-group">
        <label class="form-label">LocalStorage JSON</label>
        <textarea class="form-textarea" readonly id="orderLocalStorage">${order.localStorage}</textarea>
        <button class="copy-btn btn-full" onclick="copyToClipboard('orderLocalStorage')" style="margin-top: 0.5rem;">📋 Sao chép LocalStorage</button>
      </div>
      
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: var(--text-secondary);">Thời hạn sử dụng:</span>
          <span style="font-weight: 600;">${order.daysRemaining} ngày</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Hết hạn vào:</span>
          <span style="font-weight: 600;">${formatDate(order.endDate)}</span>
        </div>
      </div>
    </div>
    
    <div class="alert alert-info">
      💡 Vui lòng lưu lại thông tin này. Bạn có thể xem lại trong mục "Lịch sử mua hàng"
    </div>
  `;

    document.getElementById('orderDetailsContent').innerHTML = detailsHtml;
    document.getElementById('orderDetailsModal').classList.add('active');
}

/**
 * Copy to clipboard helper
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    alert('Đã sao chép!');
}

/**
 * Show purchase history
 */
function showPurchaseHistory() {
    const currentUser = getCurrentUser();
    const userOrders = db.orders.filter(o => o.userId === currentUser.id);

    if (userOrders.length === 0) {
        alert('Bạn chưa có đơn hàng nào');
        return;
    }

    // Create a modal to show orders
    let historyHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Lịch sử mua hàng</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Dịch vụ</th>
                  <th>Ngày mua</th>
                  <th>Số ngày</th>
                  <th>Giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${userOrders.map(order => `
                  <tr>
                    <td>${order.serviceType}</td>
                    <td>${formatDate(order.purchaseDate)}</td>
                    <td>${order.daysRemaining} ngày</td>
                    <td>${formatPrice(order.pricePaid)}</td>
                    <td>
                      <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="showOrderDetails('${order.id}'); this.closest('.modal').remove();">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', historyHtml);
}

/**
 * Show transaction history
 */
function showTransactionHistory() {
    const currentUser = getCurrentUser();
    const userTransactions = db.transactions.filter(t => t.userId === currentUser.id);

    if (userTransactions.length === 0) {
        alert('Bạn chưa có giao dịch nào');
        return;
    }

    let historyHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Lịch sử giao dịch</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${userTransactions.map(t => `
                  <tr>
                    <td><span class="badge badge-info">${t.type}</span></td>
                    <td>${t.description || t.type}</td>
                    <td style="color: ${t.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                      ${t.amount > 0 ? '+' : ''}${formatPrice(Math.abs(t.amount))}
                    </td>
                    <td>${formatDate(t.timestamp)}</td>
                    <td><span class="badge badge-${t.status === 'completed' ? 'success' : 'warning'}">${t.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', historyHtml);
}

/**
 * Show affiliate panel
 */
function showAffiliatePanel() {
    const currentUser = getCurrentUser();
    const stats = getAffiliateStats(currentUser.id, db);

    let panelHtml = `
    <div class="modal active">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">🎁 Affiliate Dashboard</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            💰 Hoa hồng: ${stats.commissionRate} trên mỗi đơn hàng từ link giới thiệu của bạn
          </div>
          
          <div class="form-group">
            <label class="form-label">Link giới thiệu của bạn</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" class="form-input" value="${stats.referralLink}" readonly id="affiliateLink">
              <button class="copy-btn" onclick="copyToClipboard('affiliateLink'); alert('Đã sao chép link!')">📋</button>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Tổng hoa hồng</div>
              <div class="stat-value">${formatPrice(stats.totalEarnings)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Số lượt giới thiệu</div>
              <div class="stat-value">${stats.totalReferrals}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Đã rút</div>
              <div class="stat-value">${formatPrice(stats.totalWithdrawn)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Có thể rút</div>
              <div class="stat-value">${formatPrice(stats.availableBalance)}</div>
            </div>
          </div>
          
          <div style="margin-top: 2rem;">
            <h4 style="margin-bottom: 1rem;">Rút tiền</h4>
            
            <div class="form-group">
              <label class="form-label">Số tiền muốn rút</label>
              <input type="number" class="form-input" id="withdrawAmount" placeholder="Nhập số tiền" min="50000">
            </div>
            
            <div class="form-group">
              <label class="form-label">Phương thức</label>
              <select class="form-select" id="withdrawMethod">
                <option value="bank">Ngân hàng</option>
                <option value="card">Thẻ cào điện thoại</option>
                <option value="game_card">Thẻ game</option>
                <option value="convert_to_deposit">Chuyển sang Ví nạp</option>
              </select>
            </div>
            
            <div class="form-group" id="withdrawDetailsGroup">
              <label class="form-label">Thông tin chi tiết</label>
              <textarea class="form-textarea" id="withdrawDetails" placeholder="Số tài khoản, tên ngân hàng, hoặc thông tin nhận thẻ..."></textarea>
            </div>
            
            <button class="btn btn-success btn-full" onclick="submitWithdrawal()">Yêu cầu rút tiền</button>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', panelHtml);

    // Hide details field if converting to deposit
    document.getElementById('withdrawMethod').addEventListener('change', function () {
        const detailsGroup = document.getElementById('withdrawDetailsGroup');
        if (this.value === 'convert_to_deposit') {
            detailsGroup.classList.add('hidden');
        } else {
            detailsGroup.classList.remove('hidden');
        }
    });
}

/**
 * Submit withdrawal request
 */
function submitWithdrawal() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    const method = document.getElementById('withdrawMethod').value;
    const details = document.getElementById('withdrawDetails').value;

    if (!amount || amount <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ');
        return;
    }

    if (method !== 'convert_to_deposit' && !details.trim()) {
        alert('Vui lòng nhập thông tin chi tiết');
        return;
    }

    const currentUser = getCurrentUser();
    const result = processWithdrawal(currentUser.id, amount, method, details, db);

    if (result.success) {
        alert(result.message);
        updateWalletDisplay();
        document.querySelector('.modal.active').remove();
    } else {
        alert('Lỗi: ' + result.message);
    }
}

/**
 * Show deposit modal
 */
function showDepositModal() {
    document.getElementById('depositModal').classList.add('active');
    document.getElementById('depositQRCode').classList.add('hidden');
}

/**
 * Generate deposit QR code
 */
function generateDepositQR() {
    const amount = document.getElementById('depositAmount').value;

    if (!amount || amount < 10000) {
        alert('Số tiền nạp tối thiểu là 10,000 VND');
        return;
    }

    const currentUser = getCurrentUser();
    const transactionCode = `${currentUser.username}${Math.floor(Math.random() * 1000000)}`;

    // Generate QR code using a free API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transactionCode)}`;

    document.getElementById('qrCodeImage').src = qrCodeUrl;
    document.getElementById('transactionCode').textContent = transactionCode;
    document.getElementById('depositQRCode').classList.remove('hidden');

    // In a real app, you would send this to the server to track the pending deposit
}

/**
 * Copy transaction code
 */
function copyTransactionCode() {
    const code = document.getElementById('transactionCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Đã sao chép mã giao dịch!');
    });
}

/**
 * Close modals
 */
function closePurchaseModal() {
    document.getElementById('purchaseModal').classList.remove('active');
    currentProduct = null;
}

function closeOrderDetails() {
    document.getElementById('orderDetailsModal').classList.remove('active');
}

function closeDepositModal() {
    document.getElementById('depositModal').classList.remove('active');
    document.getElementById('depositQRCode').classList.add('hidden');
    document.getElementById('depositAmount').value = '';
}

/**
 * Toggle sidebar
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

/**
 * Logout
 */
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        logoutUser();
        window.location.href = 'login.html';
    }
}

/**
 * Show active notification
 */
function showActiveNotification() {
    const notificationHidden = localStorage.getItem('notificationHidden');

    if (notificationHidden) {
        const hideUntil = new Date(notificationHidden);
        const now = new Date();

        if (now < hideUntil) {
            return; // Still hidden
        } else {
            localStorage.removeItem('notificationHidden');
        }
    }

    const activeNotifications = db.notifications.filter(n => n.isActive);

    if (activeNotifications.length > 0) {
        const notification = activeNotifications[0]; // Show first active notification
        document.getElementById('notificationMessage').innerHTML = notification.message;
        document.getElementById('notificationPopup').classList.add('active');
    }
}

/**
 * Close notification temporarily
 */
function closeNotification() {
    document.getElementById('notificationPopup').classList.remove('active');
}

/**
 * Hide notification for 24 hours
 */
function hideNotification24h() {
    const hideUntil = new Date();
    hideUntil.setHours(hideUntil.getHours() + 24);

    localStorage.setItem('notificationHidden', hideUntil.toISOString());
    document.getElementById('notificationPopup').classList.remove('active');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
