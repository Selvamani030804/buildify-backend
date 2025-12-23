const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const fs = require('fs'); // <--- 1. We import the File System module

dotenv.config();

const HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev";

router.post('/generate-logo', async (req, res) => {
    try {
        const { description } = req.body;
        console.log("🎨 Generating Logo for:", description);

        const prompt = `A modern, professional, minimalist vector logo for a business described as: "${description}". High quality, white background, flat design.`;

        const response = await fetch(HF_MODEL_URL, {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API Failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // --- 2. THE FIX: Save the image to your project folder ---
        fs.writeFileSync("generated_logo.png", buffer);
        console.log("✅ Image saved to 'generated_logo.png'");

        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
        res.json({ success: true, image: base64Image });

    } catch (error) {
        console.error("❌ Logo Error:", error.message);
        res.status(500).json({ error: "Logo generation failed", details: error.message });
    }
});

module.exports = router;