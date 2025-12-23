const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkVersion() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Try to print available version
  const response = await genAI.listModels(); // This might work if your SDK is up to date.
  console.log('Supported models:', response);
}

checkVersion();
