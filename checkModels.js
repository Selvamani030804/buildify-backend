const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
    apiVersion: 'v1',  // Make sure it's using the latest API version
  });

  try {
    const models = await genAI.listModels(); // List all models
    console.log(models); // Output the list of models available to you
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listModels();
