// config/commands.js
/**
 * Command definitions and help text for the Info Hub Bot
 */

// Bot information
const BOT_INFO = {
  name: "Info Hub Bot",
  version: "1.0.0",
  description: "Your intelligent Slack assistant for information, AI-powered responses, and productivity tools.",
  features: [
    "Basic commands (help, status, info)",
    "AI-powered Q&A and text processing",
    "Weather information",
    "News updates", 
    "Time zone utilities"
  ],
  github: "https://github.com/kevinace1/info-hub-bot",
  support: "Mention @bot help for assistance"
};

// Command categories
const COMMAND_CATEGORIES = {
  BASIC: "Basic Commands",
  AI: "AI-Powered Features", 
  INFO_HUB: "Information Hub"
};

// Basic commands
const BASIC_COMMANDS = [
  {
    name: "help",
    usage: "help [category]",
    description: "Show available commands or help for specific category",
    category: COMMAND_CATEGORIES.BASIC,
    examples: [
      "@bot help",
      "@bot help ai",
      "@bot help info"
    ]
  },
  {
    name: "status",
    usage: "status",
    description: "Show bot health and system information",
    category: COMMAND_CATEGORIES.BASIC,
    examples: ["@bot status"]
  },
  {
    name: "info",
    usage: "info",
    description: "Show bot information and capabilities",
    category: COMMAND_CATEGORIES.BASIC,
    examples: ["@bot info"]
  },
  {
    name: "ping",
    usage: "ping",
    description: "Check if bot is responsive",
    category: COMMAND_CATEGORIES.BASIC,
    examples: ["@bot ping"]
  }
];

// AI commands (to be implemented in Phase 3)
const AI_COMMANDS = [
  {
    name: "ask",
    usage: "ask [question]",
    description: "Ask any question and get an AI-powered answer",
    category: COMMAND_CATEGORIES.AI,
    examples: [
      "@bot ask What is machine learning?",
      "@bot ask How do I optimize my code?"
    ]
  },
  {
    name: "summarize",
    usage: "summarize [text]",
    description: "Summarize long text into key points",
    category: COMMAND_CATEGORIES.AI,
    examples: ["@bot summarize [paste your text here]"]
  },
  {
    name: "explain",
    usage: "explain [topic]",
    description: "Get detailed explanations of concepts or topics",
    category: COMMAND_CATEGORIES.AI,
    examples: [
      "@bot explain blockchain",
      "@bot explain REST APIs"
    ]
  }
];

// Info Hub commands (to be implemented in Phase 4)
const INFO_HUB_COMMANDS = [
  {
    name: "weather",
    usage: "weather [location]",
    description: "Get current weather information for any location",
    category: COMMAND_CATEGORIES.INFO_HUB,
    examples: [
      "@bot weather New York",
      "@bot weather London, UK"
    ]
  },
  {
    name: "news",
    usage: "news [category|keyword]",
    description: "Get latest news headlines",
    category: COMMAND_CATEGORIES.INFO_HUB,
    examples: [
      "@bot news",
      "@bot news technology",
      "@bot news bitcoin"
    ]
  },
  {
    name: "time",
    usage: "time [timezone]",
    description: "Get current time in different timezones",
    category: COMMAND_CATEGORIES.INFO_HUB,
    examples: [
      "@bot time EST",
      "@bot time Tokyo",
      "@bot time zones"
    ]
  }
];

// All commands combined
const ALL_COMMANDS = [
  ...BASIC_COMMANDS,
  ...AI_COMMANDS,
  ...INFO_HUB_COMMANDS
];

// Get commands by category
function getCommandsByCategory(category) {
  return ALL_COMMANDS.filter(cmd => cmd.category === category);
}

// Get all command names for validation
function getAllCommandNames() {
  return ALL_COMMANDS.map(cmd => cmd.name);
}

// Get command by name
function getCommandByName(name) {
  return ALL_COMMANDS.find(cmd => cmd.name === name);
}

// Get available categories
function getCategories() {
  return Object.values(COMMAND_CATEGORIES);
}

// Get category by name (case insensitive)
function getCategoryByName(name) {
  const lowerName = name.toLowerCase();
  const categoryMap = {
    'basic': COMMAND_CATEGORIES.BASIC,
    'ai': COMMAND_CATEGORIES.AI,
    'info': COMMAND_CATEGORIES.INFO_HUB,
    'hub': COMMAND_CATEGORIES.INFO_HUB
  };
  return categoryMap[lowerName];
}

module.exports = {
  BOT_INFO,
  COMMAND_CATEGORIES,
  BASIC_COMMANDS,
  AI_COMMANDS,
  INFO_HUB_COMMANDS,
  ALL_COMMANDS,
  getCommandsByCategory,
  getAllCommandNames,
  getCommandByName,
  getCategories,
  getCategoryByName
};
