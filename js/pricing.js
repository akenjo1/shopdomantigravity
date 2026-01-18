// Anti-Loss Pricing Engine
// Implements the core pricing calculation logic

/**
 * Calculate the number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number} Number of days
 */
function calculateTotalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate the daily price of a service
 * @param {number} originalPrice - Original purchase price (P)
 * @param {Date} startDate - Service start date (D1)
 * @param {Date} endDate - Service end date (D2)
 * @returns {number} Daily price
 */
function calculateDailyPrice(originalPrice, startDate, endDate) {
  const totalDays = calculateTotalDays(startDate, endDate);
  if (totalDays === 0) return 0;
  return originalPrice / totalDays;
}

/**
 * Calculate remaining days from current date
 * @param {Date} endDate - Service end date
 * @returns {number} Remaining days
 */
function calculateRemainingDays(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return 0 if expired, otherwise return remaining days
  return diffDays < 0 ? 0 : diffDays;
}

/**
 * Calculate the selling price (MANDATORY full period purchase)
 * @param {number} originalPrice - Original purchase price
 * @param {Date} startDate - Service start date
 * @param {Date} endDate - Service end date
 * @returns {Object} Pricing details
 */
function calculateSellingPrice(originalPrice, startDate, endDate) {
  const dailyPrice = calculateDailyPrice(originalPrice, startDate, endDate);
  const remainingDays = calculateRemainingDays(endDate);
  const sellingPrice = dailyPrice * remainingDays;
  
  return {
    dailyPrice: Math.round(dailyPrice),
    remainingDays: remainingDays,
    sellingPrice: Math.round(sellingPrice),
    originalPrice: originalPrice,
    isExpired: remainingDays === 0
  };
}

/**
 * Validate if user is purchasing the full remaining period
 * Anti-loss mechanism: Force full-period purchase
 * @param {number} requestedDays 
 * @param {number} remainingDays 
 * @returns {boolean}
 */
function validatePurchase(requestedDays, remainingDays) {
  // MUST purchase ALL remaining days
  return requestedDays === remainingDays;
}

/**
 * Format price to Vietnamese Dong
 * @param {number} price 
 * @returns {string}
 */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

/**
 * Format date to Vietnamese format
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
