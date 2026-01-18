// Local Storage Database Management
// In production, this should be replaced with a real database (PostgreSQL, MySQL, MongoDB)

const DB_KEY = 'account_shop_db';

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Initialize database with default structure
 * @returns {Object}
 */
function initializeDatabase() {
    const defaultDb = {
        users: [
            {
                id: 'admin001',
                username: 'admin',
                password: 'admin123', // In production, use hashed passwords
                email: 'admin@shop.com',
                role: 'admin',
                depositWallet: 0,
                commissionWallet: 0,
                affiliateCode: 'ADMIN-SYSTEM',
                createdAt: new Date().toISOString()
            }
        ],
        products: [
            {
                id: 'prod001',
                serviceType: 'CapCut Pro',
                username: 'demo_capcut@email.com',
                password: 'demo123456',
                cookie: 'session_cookie_here',
                localStorage: '{"key":"value"}',
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                originalPrice: 1200000,
                status: 'available',
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod002',
                serviceType: 'Youtube Premium',
                username: 'demo_youtube@email.com',
                password: 'ytdemo123',
                cookie: 'yt_session_cookie',
                localStorage: '{}',
                startDate: '2026-01-10',
                endDate: '2026-07-10',
                originalPrice: 780000,
                status: 'available',
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod003',
                serviceType: 'Netflix Premium',
                username: 'demo_netflix@email.com',
                password: 'netflix123',
                cookie: 'netflix_session',
                localStorage: '{}',
                startDate: '2026-01-15',
                endDate: '2026-06-15',
                originalPrice: 600000,
                status: 'available',
                createdAt: new Date().toISOString()
            }
        ],
        orders: [],
        transactions: [],
        notifications: [
            {
                id: 'notif001',
                message: '🎉 Chào mừng bạn đến với hệ thống bán tài khoản! Hiện đang có chương trình giảm giá 20% cho lần mua đầu tiên.',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ],
        giftcodes: [],
        settings: {
            qrCodeUrl: '',
            depositInstruction: 'Chuyển khoản theo mã nội dung bên dưới',
            minDeposit: 10000,
            minWithdrawal: 50000
        }
    };

    return defaultDb;
}

/**
 * Load database from localStorage
 * @returns {Object}
 */
function loadDatabase() {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }

    // Initialize if no database found
    const db = initializeDatabase();
    saveDatabase(db);
    return db;
}

/**
 * Save database to localStorage
 * @param {Object} db 
 */
function saveDatabase(db) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error('Error saving database:', error);
        alert('Lỗi lưu dữ liệu. Dung lượng localStorage có thể đã đầy.');
    }
}

/**
 * Get current logged in user from session
 * @returns {Object|null}
 */
function getCurrentUser() {
    try {
        const userStr = sessionStorage.getItem('currentUser');
        if (userStr) {
            return JSON.parse(userStr);
        }
    } catch (error) {
        console.error('Error getting current user:', error);
    }
    return null;
}

/**
 * Set current logged in user
 * @param {Object} user 
 */
function setCurrentUser(user) {
    try {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

/**
 * Logout current user
 */
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('referralCode');
}

/**
 * Check if user is admin
 * @param {Object} user 
 * @returns {boolean}
 */
function isAdmin(user) {
    return user && user.role === 'admin';
}

/**
 * Authenticate user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object}
 */
function authenticateUser(username, password) {
    const db = loadDatabase();
    const user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        // Don't store password in session
        const { password: pwd, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        return { success: true, user: userWithoutPassword };
    }

    return { success: false, message: 'Invalid username or password' };
}

/**
 * Register new user
 * @param {string} username 
 * @param {string} password 
 * @param {string} email 
 * @returns {Object}
 */
function registerUser(username, password, email) {
    const db = loadDatabase();

    // Check if username exists
    if (db.users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists' };
    }

    // Check if email exists
    if (db.users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }

    const newUser = {
        id: generateId(),
        username: username,
        password: password, // In production, hash this!
        email: email,
        role: 'user',
        depositWallet: 0,
        commissionWallet: 0,
        affiliateCode: generateAffiliateCode(username),
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabase(db);

    const { password: pwd, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
}

/**
 * Clean old logs and transactions (30+ days old)
 * @param {Object} db 
 * @returns {number} Number of items deleted
 */
function cleanOldLogs(db) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const initialLength = db.transactions.length;

    // Keep only transactions from last 30 days or pending withdrawals
    db.transactions = db.transactions.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= thirtyDaysAgo || (t.type === 'withdrawal' && t.status === 'pending');
    });

    saveDatabase(db);

    return initialLength - db.transactions.length;
}
