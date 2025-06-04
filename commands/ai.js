// commands/ai.js
/**
 * AI-powered commands: ask, summarize, explain
 */

const { 
  formatSuccess, 
  formatError, 
  formatLoading,
  formatInfo 
} = require('../utils/responses');

const {
  isOpenAIAvailable,
  askQuestion,
  summarizeText,
  explainTopic
} = require('../utils/openai');

/**
 * Handle ask command
 * @param {string} question - The user's question
 * @returns {Promise<Object>} - Formatted response
 */
async function handleAsk(question) {
  try {
    // Check if OpenAI is available
    if (!isOpenAIAvailable()) {
      return formatError('AI features are not available. OpenAI API key is not configured.');
    }

    // Validate input
    if (!question || question.trim().length === 0) {
      return formatError('Please provide a question to ask.\nExample: `@bot ask What is machine learning?`');
    }

    if (question.length > 1000) {
      return formatError('Question is too long. Please keep it under 1000 characters.');
    }

    console.log(`Processing ask command: "${question.substring(0, 100)}..."`);

    // Generate AI response
    const answer = await askQuestion(question);
    
    // Format the response
    let responseText = `🤖 *AI Assistant*\n\n`;
    responseText += `*Question:* ${question}\n\n`;
    responseText += `*Answer:*\n${answer}`;
    
    return { text: responseText };
    
  } catch (error) {
    console.error('Error in handleAsk:', error);
    return formatError(`Sorry, I couldn't process your question: ${error.message}`);
  }
}

/**
 * Handle summarize command
 * @param {string} text - Text to summarize
 * @returns {Promise<Object>} - Formatted response
 */
async function handleSummarize(text) {
  try {
    // Check if OpenAI is available
    if (!isOpenAIAvailable()) {
      return formatError('AI features are not available. OpenAI API key is not configured.');
    }

    // Validate input
    if (!text || text.trim().length === 0) {
      return formatError('Please provide text to summarize.\nExample: `@bot summarize [paste your text here]`');
    }

    if (text.length < 100) {
      return formatError('Text is too short to summarize. Please provide at least 100 characters.');
    }

    if (text.length > 4000) {
      return formatError('Text is too long. Please keep it under 4000 characters.');
    }

    console.log(`Processing summarize command for text of length: ${text.length}`);

    // Generate summary
    const summary = await summarizeText(text);
    
    // Format the response
    let responseText = `📝 *Text Summary*\n\n`;
    responseText += `*Original length:* ${text.length} characters\n`;
    responseText += `*Summary length:* ${summary.length} characters\n\n`;
    responseText += `*Summary:*\n${summary}`;
    
    return { text: responseText };
    
  } catch (error) {
    console.error('Error in handleSummarize:', error);
    return formatError(`Sorry, I couldn't summarize the text: ${error.message}`);
  }
}

/**
 * Handle explain command
 * @param {string} topic - Topic to explain
 * @returns {Promise<Object>} - Formatted response
 */
async function handleExplain(topic) {
  try {
    // Check if OpenAI is available
    if (!isOpenAIAvailable()) {
      return formatError('AI features are not available. OpenAI API key is not configured.');
    }

    // Validate input
    if (!topic || topic.trim().length === 0) {
      return formatError('Please provide a topic to explain.\nExample: `@bot explain blockchain` or `@bot explain REST APIs`');
    }

    if (topic.length > 200) {
      return formatError('Topic is too long. Please keep it under 200 characters.');
    }

    console.log(`Processing explain command for topic: "${topic}"`);

    // Generate explanation
    const explanation = await explainTopic(topic);
    
    // Format the response
    let responseText = `🎓 *Topic Explanation*\n\n`;
    responseText += `*Topic:* ${topic}\n\n`;
    responseText += `*Explanation:*\n${explanation}`;
    
    return { text: responseText };
    
  } catch (error) {
    console.error('Error in handleExplain:', error);
    return formatError(`Sorry, I couldn't explain "${topic}": ${error.message}`);
  }
}

/**
 * Get AI status information
 * @returns {Object} - AI status response
 */
function getAIStatus() {
  const isAvailable = isOpenAIAvailable();
  
  if (isAvailable) {
    return formatSuccess('AI features are available and ready to use!');
  } else {
    return formatInfo('AI features are not configured. Please set the OPENAI_API_KEY environment variable.');
  }
}

module.exports = {
  handleAsk,
  handleSummarize,
  handleExplain,
  getAIStatus
};
