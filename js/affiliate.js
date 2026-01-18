// Affiliate System - 30% Commission Model

const COMMISSION_RATE = 0.30; // 30% commission

/**
 * Calculate affiliate commission (30% of order value)
 * @param {number} orderValue - Total order value
 * @returns {number} Commission amount
 */
function calculateCommission(orderValue) {
    return Math.round(orderValue * COMMISSION_RATE);
}

/**
 * Generate unique affiliate code for user
 * @param {string} username 
 * @returns {string}
 */
function generateAffiliateCode(username) {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${username.toUpperCase()}-${randomSuffix}`;
}

/**
 * Generate affiliate referral link
 * @param {string} affiliateCode 
 * @returns {string}
 */
function generateReferralLink(affiliateCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${affiliateCode}`;
}

/**
 * Track affiliate purchase and add commission
 * @param {string} referrerCode - Affiliate code of referrer
 * @param {number} orderValue - Order value
 * @param {Object} db - Database object
 * @returns {Object} Transaction result
 */
function trackAffiliatePurchase(referrerCode, orderValue, db) {
    // Find referrer user
    const referrer = db.users.find(u => u.affiliateCode === referrerCode);

    if (!referrer) {
        return { success: false, message: 'Invalid referral code' };
    }

    const commission = calculateCommission(orderValue);

    // Add commission to referrer's commission wallet
    referrer.commissionWallet += commission;

    // Record transaction
    const transaction = {
        id: generateId(),
        userId: referrer.id,
        type: 'commission',
        amount: commission,
        orderValue: orderValue,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };

    db.transactions.push(transaction);

    // Save database
    saveDatabase(db);

    return {
        success: true,
        commission: commission,
        referrerId: referrer.id,
        transaction: transaction
    };
}

/**
 * Get affiliate statistics for a user
 * @param {string} userId 
 * @param {Object} db 
 * @returns {Object}
 */
function getAffiliateStats(userId, db) {
    const user = db.users.find(u => u.id === userId);

    if (!user) {
        return null;
    }

    // Get all commission transactions
    const commissionTransactions = db.transactions.filter(
        t => t.userId === userId && t.type === 'commission'
    );

    const totalEarnings = commissionTransactions.reduce(
        (sum, t) => sum + t.amount, 0
    );

    const totalReferrals = commissionTransactions.length;

    // Get withdrawal transactions
    const withdrawals = db.transactions.filter(
        t => t.userId === userId && t.type === 'withdrawal'
    );

    const totalWithdrawn = withdrawals.reduce(
        (sum, t) => sum + t.amount, 0
    );

    return {
        affiliateCode: user.affiliateCode,
        referralLink: generateReferralLink(user.affiliateCode),
        totalEarnings: totalEarnings,
        totalReferrals: totalReferrals,
        totalWithdrawn: totalWithdrawn,
        availableBalance: user.commissionWallet,
        commissionRate: COMMISSION_RATE * 100 + '%'
    };
}

/**
 * Process withdrawal from commission wallet
 * @param {string} userId 
 * @param {number} amount 
 * @param {string} method - 'bank', 'card', 'game_card', 'convert_to_deposit'
 * @param {Object} details - Withdrawal details (account number, etc.)
 * @param {Object} db 
 * @returns {Object}
 */
function processWithdrawal(userId, amount, method, details, db) {
    const user = db.users.find(u => u.id === userId);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    // Check if sufficient balance in commission wallet
    if (user.commissionWallet < amount) {
        return { success: false, message: 'Insufficient commission balance' };
    }

    // Minimum withdrawal amount
    const MIN_WITHDRAWAL = 50000; // 50,000 VND
    if (amount < MIN_WITHDRAWAL) {
        return { success: false, message: `Minimum withdrawal: ${formatPrice(MIN_WITHDRAWAL)}` };
    }

    if (method === 'convert_to_deposit') {
        // Convert commission to deposit wallet
        user.commissionWallet -= amount;
        user.depositWallet += amount;

        const transaction = {
            id: generateId(),
            userId: userId,
            type: 'conversion',
            amount: amount,
            from: 'commission',
            to: 'deposit',
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        db.transactions.push(transaction);
        saveDatabase(db);

        return {
            success: true,
            message: 'Converted to deposit wallet successfully',
            transaction: transaction
        };
    } else {
        // Withdrawal to external method (bank, card, etc.)
        user.commissionWallet -= amount;

        const transaction = {
            id: generateId(),
            userId: userId,
            type: 'withdrawal',
            amount: amount,
            method: method,
            details: details,
            timestamp: new Date().toISOString(),
            status: 'pending' // Admin needs to approve
        };

        db.transactions.push(transaction);
        saveDatabase(db);

        return {
            success: true,
            message: 'Withdrawal request submitted. Awaiting admin approval.',
            transaction: transaction
        };
    }
}

/**
 * Get referral code from URL
 * @returns {string|null}
 */
function getReferralCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

/**
 * Store referral code in session for purchase tracking
 * @param {string} referralCode 
 */
function storeReferralCode(referralCode) {
    if (referralCode) {
        sessionStorage.setItem('referralCode', referralCode);
    }
}

/**
 * Get stored referral code
 * @returns {string|null}
 */
function getStoredReferralCode() {
    return sessionStorage.getItem('referralCode');
}

/**
 * Clear stored referral code after purchase
 */
function clearReferralCode() {
    sessionStorage.removeItem('referralCode');
}
