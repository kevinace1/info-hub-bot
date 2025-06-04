// utils/responses.js
/**
 * Standardized response formatting for the Slack bot
 */

/**
 * Format a success response
 * @param {string} message - The main message
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response object
 */
function formatSuccess(message, options = {}) {
  return {
    text: `✅ ${message}`,
    ...options
  };
}

/**
 * Format an error response
 * @param {string} message - The error message
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response object
 */
function formatError(message, options = {}) {
  return {
    text: `❌ ${message}`,
    ...options
  };
}

/**
 * Format an info response
 * @param {string} message - The info message
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response object
 */
function formatInfo(message, options = {}) {
  return {
    text: `ℹ️ ${message}`,
    ...options
  };
}

/**
 * Format a warning response
 * @param {string} message - The warning message
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response object
 */
function formatWarning(message, options = {}) {
  return {
    text: `⚠️ ${message}`,
    ...options
  };
}

/**
 * Format a help response with sections
 * @param {string} title - Help section title
 * @param {Array} commands - Array of command objects
 * @returns {Object} - Formatted help response
 */
function formatHelp(title, commands) {
  let helpText = `📚 *${title}*\n\n`;
  
  commands.forEach(cmd => {
    helpText += `• \`@bot ${cmd.usage}\` - ${cmd.description}\n`;
  });

  return {
    text: helpText
  };
}

/**
 * Format command suggestions for invalid commands
 * @param {string} invalidCommand - The invalid command entered
 * @param {Array} suggestions - Array of suggested commands
 * @returns {Object} - Formatted suggestion response
 */
function formatCommandSuggestions(invalidCommand, suggestions) {
  let message = `Command "${invalidCommand}" not found.`;
  
  if (suggestions.length > 0) {
    message += `\n\nDid you mean:\n`;
    suggestions.forEach(suggestion => {
      message += `• \`${suggestion}\`\n`;
    });
  }
  
  message += `\nType \`@bot help\` to see all available commands.`;
  
  return formatError(message);
}

/**
 * Format a loading/thinking response
 * @param {string} action - What the bot is doing
 * @returns {Object} - Formatted loading response
 */
function formatLoading(action = "processing") {
  return {
    text: `🤔 ${action.charAt(0).toUpperCase() + action.slice(1)}...`
  };
}

/**
 * Format status information
 * @param {Object} statusData - Status information object
 * @returns {Object} - Formatted status response
 */
function formatStatus(statusData) {
  const {
    uptime,
    version,
    responseTime,
    memoryUsage,
    aiStatus,
    lastDeployment
  } = statusData;

  let statusText = `🤖 *Bot Status*\n\n`;
  statusText += `• Status: ✅ Online\n`;
  statusText += `• Version: ${version}\n`;
  statusText += `• Uptime: ${uptime}\n`;
  statusText += `• Response Time: ${responseTime}ms\n`;
  if (memoryUsage) statusText += `• Memory Usage: ${memoryUsage}\n`;
  if (aiStatus) statusText += `• AI Features: ${aiStatus}\n`;
  if (lastDeployment) statusText += `• Last Deployed: ${lastDeployment}\n`;

  return {
    text: statusText
  };
}

/**
 * Format bot information
 * @param {Object} botInfo - Bot information object
 * @returns {Object} - Formatted info response
 */
function formatBotInfo(botInfo) {
  const {
    name,
    version,
    description,
    features,
    github,
    support
  } = botInfo;

  let infoText = `🤖 *${name}*\n\n`;
  infoText += `${description}\n\n`;
  infoText += `*Version:* ${version}\n\n`;
  
  if (features && features.length > 0) {
    infoText += `*Features:*\n`;
    features.forEach(feature => {
      infoText += `• ${feature}\n`;
    });
    infoText += `\n`;
  }
  
  if (github) infoText += `*GitHub:* ${github}\n`;
  if (support) infoText += `*Support:* ${support}\n`;

  return {
    text: infoText
  };
}

module.exports = {
  formatSuccess,
  formatError,
  formatInfo,
  formatWarning,
  formatHelp,
  formatCommandSuggestions,
  formatLoading,
  formatStatus,
  formatBotInfo
};
