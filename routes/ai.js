const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize Gemini with the API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED: Use the correct, stable model name (1.5 Flash is fast and free)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- Helper: Clean JSON String ---
// This removes the ```json ... ``` wrapper if Gemini adds it
const cleanJSON = (text) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- ROUTE 1: Generate Business Names ---
router.post('/generate-names', async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`💡 Generating names for: ${description}`);

        const prompt = `
            Act as a creative branding expert.
            Generate 10 unique, modern business names for: "${description}".
            Rules:
            1. Avoid generic names.
            2. Prefer short, punchy, coined words (like "Spotify" or "Uber").
            3. Return ONLY a JSON object with a "names" array.
            Example: { "names": ["Vixal", "Qore", "Luminary"] }
        `;

        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        
        try {
            const json = JSON.parse(text);
            res.json(json); // Returns { names: [...] }
        } catch (e) {
            // Fallback if JSON fails
            res.json({ names: text.split(',').slice(0, 5) });
        }

    } catch (error) {
        console.error("Name Gen Error:", error);
        res.status(500).json({ error: "Failed to generate names" });
    }
});

// --- ROUTE 2: Generate Slogans ---
router.post('/generate-slogans', async (req, res) => {
    try {
        const { description } = req.body;
        const prompt = `Generate 5 catchy slogans for: "${description}". Return JSON: { "slogans": ["Slogan 1", "Slogan 2"] }`;

        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        const json = JSON.parse(text);

        res.json(json);
    } catch (error) {
        console.error("Slogan Error:", error);
        res.status(500).json({ error: "Failed to generate slogans" });
    }
});

// --- ROUTE 3: Chatbot (Fixed) ---
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // Start a chat session
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are a helpful business consultant. Context: ${context}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to help you build your business." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // FIXED: Frontend expects 'reply', not 'success'
        res.json({ reply: text });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Chat failed" });
    }
});

// --- ROUTE 4: Market Validation ---
router.post('/validate', async (req, res) => {
    try {
        const { idea, industry } = req.body;
        console.log(`📊 Validating: ${idea}`);

        const prompt = `
            Analyze this startup idea: "${idea}" in the "${industry}" industry.
            Return PURE JSON with this structure:
            {
                "score": 85,
                "pros": ["Pro 1", "Pro 2"],
                "cons": ["Con 1", "Con 2"],
                "verdict": "A short summary of viability."
            }
        `;

        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        const json = JSON.parse(text);

        res.json({ analysis: json });

    } catch (error) {
        console.error("Validation Error:", error);
        res.status(500).json({ error: "Validation failed" });
    }
});

// --- ROUTE 5: UI/UX Design Generator (Fixed Black Screen) ---
router.post('/generate-ui', async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`🎨 Generating UI for: ${description}`);

        const prompt = `
            Create a UI Design System for a website about: "${description}".
            Return ONLY valid JSON.
            Structure:
            {
                "colorPalette": [
                    { "code": "#1A1A1A", "name": "Primary Black" },
                    { "code": "#FF5733", "name": "Accent Orange" },
                    { "code": "#F5F5F5", "name": "Off White" },
                    { "code": "#333333", "name": "Dark Grey" }
                ],
                "typography": {
                    "primary": "Inter",
                    "secondary": "Merriweather"
                },
                "buttonStyle": "Rounded corners with drop shadow",
                "layoutVibe": "Clean, Minimalist, and Professional",
                "components": ["Hero Section", "Feature Grid", "Testimonial Slider"]
            }
        `;

        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        
        const json = JSON.parse(text);

        // FIXED: Frontend expects the object inside 'design'
        res.json({ design: json });

    } catch (error) {
        console.error("UI Gen Error:", error);
        res.status(500).json({ error: "UI Generation failed" });
    }
});

module.exports = router;