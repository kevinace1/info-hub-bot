// utils/rateLimit.js
/**
 * Simple in-memory rate limiting for AI commands
 */

// Store user request timestamps
const userRequests = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  AI_COMMANDS: {
    maxRequests: 10,      // Max requests per window
    windowMs: 60 * 1000,  // 1 minute window
    cooldownMs: 5 * 1000  // 5 second cooldown between requests
  },
  BASIC_COMMANDS: {
    maxRequests: 30,      // More lenient for basic commands
    windowMs: 60 * 1000,  // 1 minute window
    cooldownMs: 1 * 1000  // 1 second cooldown
  }
};

/**
 * Check if a user is rate limited
 * @param {string} userId - Slack user ID
 * @param {string} commandType - 'AI_COMMANDS' or 'BASIC_COMMANDS'
 * @returns {Object} - { allowed: boolean, retryAfter?: number, message?: string }
 */
function checkRateLimit(userId, commandType = 'AI_COMMANDS') {
  const now = Date.now();
  const limits = RATE_LIMITS[commandType];
  
  if (!limits) {
    console.warn(`Unknown command type: ${commandType}`);
    return { allowed: true };
  }

  // Get user's request history
  if (!userRequests.has(userId)) {
    userRequests.set(userId, []);
  }
  
  const requests = userRequests.get(userId);
  
  // Remove old requests outside the window
  const windowStart = now - limits.windowMs;
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  // Check cooldown (time since last request)
  if (recentRequests.length > 0) {
    const lastRequest = Math.max(...recentRequests);
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < limits.cooldownMs) {
      const retryAfter = Math.ceil((limits.cooldownMs - timeSinceLastRequest) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Please wait ${retryAfter} seconds before making another request.`
      };
    }
  }
  
  // Check if user has exceeded max requests in window
  if (recentRequests.length >= limits.maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = Math.ceil((oldestRequest + limits.windowMs - now) / 1000);
    
    return {
      allowed: false,
      retryAfter,
      message: `Rate limit exceeded. You can make ${limits.maxRequests} ${commandType.toLowerCase().replace('_', ' ')} per minute. Try again in ${retryAfter} seconds.`
    };
  }
  
  // Update user's request history
  recentRequests.push(now);
  userRequests.set(userId, recentRequests);
  
  return { allowed: true };
}

/**
 * Get rate limit status for a user
 * @param {string} userId - Slack user ID
 * @param {string} commandType - Command type
 * @returns {Object} - Rate limit status
 */
function getRateLimitStatus(userId, commandType = 'AI_COMMANDS') {
  const limits = RATE_LIMITS[commandType];
  const requests = userRequests.get(userId) || [];
  const now = Date.now();
  const windowStart = now - limits.windowMs;
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  return {
    requestsInWindow: recentRequests.length,
    maxRequests: limits.maxRequests,
    windowMs: limits.windowMs,
    remainingRequests: Math.max(0, limits.maxRequests - recentRequests.length),
    resetTime: recentRequests.length > 0 ? Math.min(...recentRequests) + limits.windowMs : now
  };
}

/**
 * Clean up old rate limit data (call periodically)
 */
function cleanupRateLimitData() {
  const now = Date.now();
  const maxAge = Math.max(...Object.values(RATE_LIMITS).map(limit => limit.windowMs)) * 2;
  
  for (const [userId, requests] of userRequests.entries()) {
    const recentRequests = requests.filter(timestamp => timestamp > now - maxAge);
    
    if (recentRequests.length === 0) {
      userRequests.delete(userId);
    } else {
      userRequests.set(userId, recentRequests);
    }
  }
  
  console.log(`Rate limit cleanup completed. Active users: ${userRequests.size}`);
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitData, 5 * 60 * 1000);

module.exports = {
  checkRateLimit,
  getRateLimitStatus,
  cleanupRateLimitData,
  RATE_LIMITS
};
