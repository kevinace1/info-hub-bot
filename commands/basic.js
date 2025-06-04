// commands/basic.js
/**
 * Basic bot commands: help, status, info, ping
 */

const { 
  formatHelp, 
  formatStatus, 
  formatBotInfo, 
  formatSuccess,
  formatError 
} = require('../utils/responses');

const {
  BOT_INFO,
  COMMAND_CATEGORIES,
  getCommandsByCategory,
  getCategoryByName,
  ALL_COMMANDS
} = require('../config/commands');

/**
 * Handle help command
 * @param {string} category - Optional category filter
 * @returns {Object} - Formatted help response
 */
function handleHelp(category = null) {
  try {
    if (!category) {
      // Show all commands organized by category
      let helpText = `📚 *${BOT_INFO.name} - Available Commands*\n\n`;
      
      // Basic Commands
      helpText += `*${COMMAND_CATEGORIES.BASIC}:*\n`;
      getCommandsByCategory(COMMAND_CATEGORIES.BASIC).forEach(cmd => {
        helpText += `• \`@bot ${cmd.usage}\` - ${cmd.description}\n`;
      });
      
      helpText += `\n*${COMMAND_CATEGORIES.AI}:*\n`;
      getCommandsByCategory(COMMAND_CATEGORIES.AI).forEach(cmd => {
        helpText += `• \`@bot ${cmd.usage}\` - ${cmd.description}\n`;
      });
      
      helpText += `\n*${COMMAND_CATEGORIES.INFO_HUB}:*\n`;
      getCommandsByCategory(COMMAND_CATEGORIES.INFO_HUB).forEach(cmd => {
        helpText += `• \`@bot ${cmd.usage}\` - ${cmd.description}\n`;
      });
      
      helpText += `\n💡 *Tip:* Use \`@bot help [category]\` for detailed help on specific categories.`;
      helpText += `\nExample: \`@bot help ai\` or \`@bot help basic\``;
      
      return { text: helpText };
    } else {
      // Show help for specific category
      const categoryName = getCategoryByName(category);
      if (!categoryName) {
        return formatError(`Category "${category}" not found. Available categories: basic, ai, info`);
      }
      
      const commands = getCommandsByCategory(categoryName);
      let helpText = `📚 *${categoryName} - Detailed Help*\n\n`;
      
      commands.forEach(cmd => {
        helpText += `*${cmd.name}*\n`;
        helpText += `Usage: \`@bot ${cmd.usage}\`\n`;
        helpText += `Description: ${cmd.description}\n`;
        if (cmd.examples && cmd.examples.length > 0) {
          helpText += `Examples:\n`;
          cmd.examples.forEach(example => {
            helpText += `  • \`${example}\`\n`;
          });
        }
        helpText += `\n`;
      });
      
      return { text: helpText };
    }
  } catch (error) {
    console.error('Error in handleHelp:', error);
    return formatError('Sorry, there was an error generating help information.');
  }
}

/**
 * Handle status command
 * @returns {Object} - Formatted status response
 */
function handleStatus() {
  try {
    const startTime = process.hrtime();
    
    // Calculate uptime (this is process uptime, not deployment uptime)
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${hours}h ${minutes}m`;
    
    // Calculate response time
    const endTime = process.hrtime(startTime);
    const responseTime = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryUsage = `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`;
    
    const statusData = {
      uptime,
      version: BOT_INFO.version,
      responseTime,
      memoryUsage,
      lastDeployment: new Date().toISOString().split('T')[0] // Today's date as placeholder
    };
    
    return formatStatus(statusData);
  } catch (error) {
    console.error('Error in handleStatus:', error);
    return formatError('Sorry, there was an error getting status information.');
  }
}

/**
 * Handle info command
 * @returns {Object} - Formatted bot info response
 */
function handleInfo() {
  try {
    return formatBotInfo(BOT_INFO);
  } catch (error) {
    console.error('Error in handleInfo:', error);
    return formatError('Sorry, there was an error getting bot information.');
  }
}

/**
 * Handle ping command
 * @returns {Object} - Formatted ping response
 */
function handlePing() {
  const responses = [
    "pong — bot online ✅",
    "🏓 pong! I'm here and ready to help!",
    "✅ pong — all systems operational!",
    "🤖 pong — Info Hub Bot at your service!"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return { text: randomResponse };
}

module.exports = {
  handleHelp,
  handleStatus,
  handleInfo,
  handlePing
};
