const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

// We switch to the RELIABLE model (FLUX) since Pix2Pix is deleted.
const HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev";

router.post('/edit-image', async (req, res) => {
    try {
        const { image, prompt } = req.body; 
        
        // Since the "Editor" model is offline, we treat this as a 
        // "Creative Re-Generation" based on the user's text command.
        console.log("🎨 Studio Generating:", prompt);

        const enhancedPrompt = `High quality, professional image, ${prompt}`;

        const response = await fetch(HF_MODEL_URL, {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: enhancedPrompt }),
        });

        if (!response.ok) {
            throw new Error(`Studio AI Failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

        res.json({ success: true, image: base64Image });

    } catch (error) {
        console.error("❌ Studio Error:", error.message);
        res.status(500).json({ error: "Studio generation failed", details: error.message });
    }
});

// Mock Video Generator (Veo)
router.post('/animate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("🎥 Starting Video Generation for:", prompt);

        await new Promise(resolve => setTimeout(resolve, 3000));

        res.json({ 
            success: true, 
            message: "Video generated successfully!",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
        });

    } catch (error) {
        res.status(500).json({ error: "Animation failed" });
    }
});

module.exports = router;