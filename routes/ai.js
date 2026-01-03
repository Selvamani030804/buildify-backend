const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED: Back to the stable model that works for everyone
const MODEL_NAME = "gemini-1.5-flash"; 
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- Helper: Clean JSON String ---
const cleanJSON = (text) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- ROUTE 1: Generate Business Names ---
router.post('/generate-names', async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`💡 Generating names with ${MODEL_NAME}...`);

        const prompt = `
            Act as a creative branding expert.
            Generate 10 unique, modern business names for: "${description}".
            Rules:
            1. Avoid generic names.
            2. Prefer short, punchy, coined words.
            3. Return ONLY a JSON object with a "names" array.
            Example: { "names": ["Vixal", "Qore", "Luminary"] }
        `;

        const result = await model.generateContent(prompt);
        const text = cleanJSON(result.response.text());
        
        try {
            const json = JSON.parse(text);
            res.json(json); 
        } catch (e) {
            res.json({ names: text.split(',').slice(0, 5) });
        }

    } catch (error) {
        console.error("Name Gen Error:", error.message);
        res.status(500).json({ error: `Model ${MODEL_NAME} failed. Try gemini-1.5-flash.` });
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
        console.error("Slogan Error:", error.message);
        res.status(500).json({ error: "Slogan generation failed" });
    }
});

// --- ROUTE 3: Chatbot ---
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
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

        res.json({ reply: text });

    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ error: "Chat failed. Model might be invalid." });
    }
});

// --- ROUTE 4: Market Validation ---
router.post('/validate', async (req, res) => {
    try {
        const { idea, industry } = req.body;
        console.log(`📊 Validating with ${MODEL_NAME}...`);

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
        console.error("Validation Error:", error.message);
        res.status(500).json({ error: "Validation failed" });
    }
});

// --- ROUTE 5: UI/UX Design Generator ---
router.post('/generate-ui', async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`🎨 Generating UI with ${MODEL_NAME}...`);

        const prompt = `
            Create a UI Design System for a website about: "${description}".
            Return ONLY valid JSON. Do NOT use markdown.
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

        res.json({ design: json });

    } catch (error) {
        console.error("UI Gen Error:", error.message);
        res.status(500).json({ error: "UI Generation failed" });
    }
});

module.exports = router;