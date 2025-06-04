// utils/openai.js
/**
 * OpenAI integration utilities
 */

const OpenAI = require('openai');

// Initialize OpenAI client
let openai = null;

function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found in environment variables');
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized');
  }
  
  return openai;
}

/**
 * Check if OpenAI is available
 * @returns {boolean}
 */
function isOpenAIAvailable() {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Generate a response using OpenAI
 * @param {string} prompt - The user's prompt
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - AI response
 */
async function generateResponse(prompt, options = {}) {
  const client = initializeOpenAI();
  
  if (!client) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  const {
    maxTokens = 500,
    temperature = 0,
    model = 'gpt-4o-mini',
    systemPrompt = 'You are a helpful assistant in a Slack workspace. Provide clear, concise, and professional responses.'
  } = options;

  try {
    console.log(`Generating AI response for prompt: "${prompt.substring(0, 100)}..."`);
    
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    console.log(`AI response generated successfully (${response.length} characters)`);
    return response;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI quota exceeded. Please check your billing.');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.name === 'TimeoutError') {
      throw new Error('Request timed out. Please try again.');
    } else {
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}

/**
 * Ask a question using OpenAI
 * @param {string} question - The user's question
 * @returns {Promise<string>} - AI answer
 */
async function askQuestion(question) {
  const systemPrompt = `You are a knowledgeable assistant in a Slack workspace. 
Answer questions clearly and concisely. If you're not sure about something, say so. 
Keep responses under 400 words and use a professional but friendly tone.`;

  return generateResponse(question, {
    systemPrompt,
    maxTokens: 600,
    temperature: 0.7
  });
}

/**
 * Summarize text using OpenAI
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summary
 */
async function summarizeText(text) {
  if (text.length < 100) {
    throw new Error('Text is too short to summarize. Please provide at least 100 characters.');
  }

  const prompt = `Please summarize the following text in a clear, concise manner. Focus on the key points and main ideas:

${text}`;

  const systemPrompt = `You are an expert at summarizing text. Create concise summaries that capture the essential information. 
Use bullet points when appropriate and keep summaries under 300 words.`;

  return generateResponse(prompt, {
    systemPrompt,
    maxTokens: 400,
    temperature: 0.5
  });
}

/**
 * Explain a topic using OpenAI
 * @param {string} topic - Topic to explain
 * @returns {Promise<string>} - Explanation
 */
async function explainTopic(topic) {
  const prompt = `Please explain "${topic}" in a clear, easy-to-understand way. Include:
- What it is
- Why it's important or relevant
- Key concepts or components
- Real-world examples if applicable

Keep the explanation accessible but informative.`;

  const systemPrompt = `You are an expert educator who explains complex topics in simple terms. 
Use analogies and examples when helpful. Keep explanations under 500 words and well-structured.`;

  return generateResponse(prompt, {
    systemPrompt,
    maxTokens: 700,
    temperature: 0.6
  });
}

module.exports = {
  isOpenAIAvailable,
  generateResponse,
  askQuestion,
  summarizeText,
  explainTopic
};
