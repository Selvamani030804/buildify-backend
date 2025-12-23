const dotenv = require('dotenv');
dotenv.config();

// 1. Get the key
const apiKey = process.env.GEMINI_API_KEY;
console.log("🔑 Testing API Key ending in:", apiKey ? apiKey.slice(-4) : "NONE");

// 2. Ask Google what models are available for this key
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function checkModels() {
    console.log("📡 Connecting to Google...");
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("❌ GOOGLE ERROR:", data.error.message);
            console.log("💡 SOLUTION: Your API Key is invalid or the API is not enabled.");
        } else if (data.models) {
            console.log("✅ SUCCESS! Your Key works. Here are your available models:");
            // List the first 5 models
            data.models.slice(0, 5).forEach(m => console.log(`   - ${m.name}`));
        } else {
            console.log("⚠️ WEIRD RESPONSE:", data);
        }
    } catch (error) {
        console.error("❌ NETWORK ERROR:", error.message);
    }
}

checkModels();