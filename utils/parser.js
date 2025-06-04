// utils/parser.js
/**
 * Parse commands from Slack app mentions
 * Expected format: @bot [command] [arguments...]
 */

/**
 * Extract command and arguments from mention text
 * @param {string} text - The full mention text (e.g., "<@U123> help weather")
 * @param {string} botUserId - The bot's user ID to remove from text
 * @returns {Object} - { command: string, args: string[], fullArgs: string }
 */
function parseCommand(text, botUserId) {
  if (!text || typeof text !== 'string') {
    return { command: null, args: [], fullArgs: '' };
  }

  // Remove the bot mention from the text
  const mentionPattern = new RegExp(`<@${botUserId}>\\s*`, 'g');
  const cleanText = text.replace(mentionPattern, '').trim();

  if (!cleanText) {
    return { command: null, args: [], fullArgs: '' };
  }

  // Split into parts and extract command
  const parts = cleanText.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const fullArgs = args.join(' ');

  return {
    command,
    args,
    fullArgs,
    originalText: text,
    cleanText
  };
}

/**
 * Validate if a command exists
 * @param {string} command - Command to validate
 * @param {Array} validCommands - Array of valid command names
 * @returns {boolean}
 */
function isValidCommand(command, validCommands) {
  return validCommands.includes(command);
}

/**
 * Get command suggestions for typos
 * @param {string} command - Invalid command
 * @param {Array} validCommands - Array of valid command names
 * @returns {Array} - Array of suggested commands
 */
function getCommandSuggestions(command, validCommands) {
  if (!command) return [];
  
  // Simple similarity check - commands that start with same letter or contain the input
  return validCommands.filter(validCmd => 
    validCmd.startsWith(command.charAt(0)) || 
    validCmd.includes(command) ||
    command.includes(validCmd)
  ).slice(0, 3); // Limit to 3 suggestions
}

module.exports = {
  parseCommand,
  isValidCommand,
  getCommandSuggestions
};
