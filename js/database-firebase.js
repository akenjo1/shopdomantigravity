// Firebase Database Management
// Replaces localStorage with Firebase Firestore

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Initialize database with default admin user
 */
async function initializeDatabase() {
    try {
        // Check if admin user exists
        const usersRef = window.firestore.collection(db, 'users');
        const q = window.firestore.query(usersRef, window.firestore.where('username', '==', 'admin'));
        const querySnapshot = await window.firestore.getDocs(q);

        if (querySnapshot.empty) {
            // Create default admin user
            await window.firestore.addDoc(usersRef, {
                id: 'admin001',
                username: 'admin',
                password: 'admin123', // In production, use hashed passwords
                email: 'admin@shop.com',
                role: 'admin',
                depositWallet: 0,
                commissionWallet: 0,
                affiliateCode: 'ADMIN-SYSTEM',
                createdAt: new Date().toISOString()
            });

            // Create demo products
            const productsRef = window.firestore.collection(db, 'products');

            await window.firestore.addDoc(productsRef, {
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
            });

            await window.firestore.addDoc(productsRef, {
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
            });

            await window.firestore.addDoc(productsRef, {
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
            });

            // Create welcome notification
            const notificationsRef = window.firestore.collection(db, 'notifications');
            await window.firestore.addDoc(notificationsRef, {
                id: 'notif001',
                message: '🎉 Chào mừng bạn đến với hệ thống bán tài khoản! Hiện đang có chương trình giảm giá 20% cho lần mua đầu tiên.',
                isActive: true,
                createdAt: new Date().toISOString()
            });

            console.log('Database initialized with demo data');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

/**
 * Get all documents from a collection
 * @param {string} collectionName 
 * @returns {Promise<Array>}
 */
async function getCollection(collectionName) {
    try {
        const colRef = window.firestore.collection(db, collectionName);
        const snapshot = await window.firestore.getDocs(colRef);
        return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error getting ${collectionName}:`, error);
        return [];
    }
}

/**
 * Add document to collection
 * @param {string} collectionName 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
async function addDocument(collectionName, data) {
    try {
        const colRef = window.firestore.collection(db, collectionName);
        const docRef = await window.firestore.addDoc(colRef, {
            ...data,
            createdAt: data.createdAt || new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(`Error adding to ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Update document in collection
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
async function updateDocument(collectionName, docId, data) {
    try {
        const docRef = window.firestore.doc(db, collectionName, docId);
        await window.firestore.updateDoc(docRef, data);
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete document from collection
 * @param {string} collectionName 
 * @param {string} docId 
 * @returns {Promise<Object>}
 */
async function deleteDocument(collectionName, docId) {
    try {
        const docRef = window.firestore.doc(db, collectionName, docId);
        await window.firestore.deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Load all data (replacement for loadDatabase)
 * @returns {Promise<Object>}
 */
async function loadDatabase() {
    try {
        const [users, products, orders, transactions, notifications] = await Promise.all([
            getCollection('users'),
            getCollection('products'),
            getCollection('orders'),
            getCollection('transactions'),
            getCollection('notifications')
        ]);

        // Get settings
        const settingsSnapshot = await getCollection('settings');
        const settings = settingsSnapshot[0] || {
            qrCodeUrl: '',
            depositInstruction: 'Chuyển khoản theo mã nội dung bên dưới',
            minDeposit: 10000,
            minWithdrawal: 50000
        };

        return {
            users,
            products,
            orders,
            transactions,
            notifications,
            settings,
            giftcodes: []
        };
    } catch (error) {
        console.error('Error loading database:', error);
        return {
            users: [],
            products: [],
            orders: [],
            transactions: [],
            notifications: [],
            settings: {},
            giftcodes: []
        };
    }
}

/**
 * Save is handled automatically by Firebase, this is a no-op for compatibility
 * @param {Object} db 
 */
function saveDatabase(db) {
    // Firebase saves automatically when using addDoc/updateDoc
    // This function exists for backward compatibility
    return;
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
 * @returns {Promise<Object>}
 */
async function authenticateUser(username, password) {
    try {
        const usersRef = window.firestore.collection(db, 'users');
        const q = window.firestore.query(
            usersRef,
            window.firestore.where('username', '==', username),
            window.firestore.where('password', '==', password)
        );
        const querySnapshot = await window.firestore.getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const user = { docId: userDoc.id, ...userDoc.data() };
            const { password: pwd, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Register new user
 * @param {string} username 
 * @param {string} password 
 * @param {string} email 
 * @returns {Promise<Object>}
 */
async function registerUser(username, password, email) {
    try {
        const usersRef = window.firestore.collection(db, 'users');

        // Check if username exists
        const usernameQuery = window.firestore.query(usersRef, window.firestore.where('username', '==', username));
        const usernameSnapshot = await window.firestore.getDocs(usernameQuery);

        if (!usernameSnapshot.empty) {
            return { success: false, message: 'Tên đăng nhập đã tồn tại' };
        }

        // Check if email exists
        const emailQuery = window.firestore.query(usersRef, window.firestore.where('email', '==', email));
        const emailSnapshot = await window.firestore.getDocs(emailQuery);

        if (!emailSnapshot.empty) {
            return { success: false, message: 'Email đã được đăng ký' };
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

        const result = await addDocument('users', newUser);

        if (result.success) {
            const { password: pwd, ...userWithoutPassword } = { ...newUser, docId: result.id };
            setCurrentUser(userWithoutPassword);
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Lỗi khi tạo tài khoản' };
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Clean old logs and transactions (30+ days old)
 * @returns {Promise<number>} Number of items deleted
 */
async function cleanOldLogs() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await getCollection('transactions');
        let deletedCount = 0;

        for (const transaction of transactions) {
            const transactionDate = new Date(transaction.timestamp);

            // Delete if older than 30 days and not a pending withdrawal
            if (transactionDate < thirtyDaysAgo &&
                !(transaction.type === 'withdrawal' && transaction.status === 'pending')) {
                await deleteDocument('transactions', transaction.docId);
                deletedCount++;
            }
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning old logs:', error);
        return 0;
    }
}

// Helper function for affiliate code generation (imported from affiliate.js)
function generateAffiliateCode(username) {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${username.toUpperCase()}-${randomSuffix}`;
}

// Initialize database when Firebase is ready
setTimeout(() => {
    if (window.firestore && db) {
        initializeDatabase();
    }
}, 1000);
