const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const Project = require('../models/Project'); // Import Project model to check database

dotenv.config();

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1',
});

// Use Gemini 2.5 Flash for speed and intelligence
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- ROUTE 1: Generate TRADEMARK-SAFE Business Names ---
router.post('/generate-names', async (req, res) => {
  try {
    const { description } = req.body;
    
    // --- SHIELD 1: THE TRADEMARK LAWYER PROMPT ---
    const prompt = `
      Act as a strict Trademark Attorney and Branding Expert.
      Generate 10 business names for a startup described as: "${description}".
      
      STRICT TRADEMARK RULES:
      1. IGNORE famous brands (No Netflix, Amazon, etc.).
      2. AVOID common names likely used by small businesses (e.g., "The Coffee Shop").
      3. PRIORITY: Create 'Neologisms' (invented words) or abstract combinations. These are safest for copyright.
      4. Simulate a mental check: If the name sounds like it already exists, DISCARD it.
      
      Return ONLY the list of names separated by commas.
      Example of Safe Names: Zylo, Plura, Vexel, Stratos, Qubix.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up the list
    let generatedNames = text.split(',').map(name => name.trim());

    // --- SHIELD 2: CHECK YOUR DATABASE ---
    // Ensure no other user on YOUR website has this name
    const existingProjects = await Project.find({ 
        businessName: { $in: generatedNames } 
    });

    // Get the list of names that are already taken inside your app
    const takenNames = existingProjects.map(p => p.businessName);

    // Filter out names taken by your users
    const availableNames = generatedNames.filter(name => !takenNames.includes(name));

    // Return the top 5 valid ones (or original list if everything was unique)
    const finalNames = availableNames.length > 0 ? availableNames.slice(0, 5) : generatedNames.slice(0, 5);

    console.log(`🛡️ Safe Names Generated: ${generatedNames.length} | Taken in DB: ${takenNames.length} | Returned: ${finalNames.length}`);

    res.json({ success: true, names: finalNames });

  } catch (error) {
    console.error("Name Gen Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ROUTE 2: Generate Slogans ---
router.post('/generate-slogans', async (req, res) => {
  try {
    const { description } = req.body;
    const prompt = `Generate 5 catchy, unique slogans for a business described as: "${description}". Return ONLY the slogans separated by '|'.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const list = text.split('|').map(s => s.trim());

    res.json({ success: true, slogans: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROUTE 3: Chatbot ---
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    let prompt = `You are a helpful expert business consultant for a startup founder.\n`;
    if (context) {
        prompt += `CONTEXT: The user is building a business described as: "${context}".\n`;
    }
    prompt += `USER QUESTION: ${message}\n`;
    prompt += `YOUR ADVICE (Keep it short, helpful, and professional):`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, reply: text });

  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(500).json({ error: "Chat failed", details: error.message });
  }
});

// --- ROUTE 4: Market Validation ---
router.post('/validate', async (req, res) => {
  try {
    const { idea, industry } = req.body;
    console.log(`📊 Validating idea: ${idea}`);

    const prompt = `
      Act as a harsh Business Consultant. 
      The user has this idea: "${idea}" in the "${industry}" industry.
      
      Analyze this and return a PURE JSON response (no markdown) with keys:
      {
        "score": (0-100),
        "pros": ["Strength 1", "Strength 2"],
        "cons": ["Risk 1", "Risk 2"],
        "verdict": "Short summary"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json({ success: true, analysis: JSON.parse(text) });

  } catch (error) {
    console.error("Validation Error:", error.message);
    res.status(500).json({ error: "Validation failed" });
  }
});

// --- ROUTE 5: UI/UX Design Generator ---
router.post('/generate-ui', async (req, res) => {
  try {
    const { description } = req.body;
    console.log(`🎨 Generating Design System for: ${description}`);

    const prompt = `
      Act as a professional UI/UX Designer.
      Create a design system for a website based on this business description: "${description}".
      
      Return a PURE JSON response (no markdown) with the following structure:
      {
        "colorPalette": {
          "primary": "#HexCode",
          "secondary": "#HexCode",
          "accent": "#HexCode",
          "background": "#HexCode",
          "text": "#HexCode"
        },
        "typography": {
          "headingFont": "Name of a popular Google Font",
          "bodyFont": "Name of a popular Google Font"
        },
        "buttonStyle": "Describe the button shape (e.g., Rounded, Square, Pill)",
        "layoutVibe": "Describe the overall look (e.g., Minimalist, Playful, Corporate)"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json({ success: true, design: JSON.parse(text) });

  } catch (error) {
    console.error("UI Generation Error:", error.message);
    res.status(500).json({ error: "UI Generation failed" });
  }
});

module.exports = router;