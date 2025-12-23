const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// ROUTE: Save a new Project
router.post('/save', async (req, res) => {
    try {
        const { userId, description, businessName, slogan, logoImage } = req.body;

        // Validation
        if (!userId || !businessName) {
            return res.status(400).json({ error: "User ID and Business Name are required" });
        }

        console.log("💾 Saving Project for User:", userId);

        const newProject = new Project({
            userId,
            description,
            businessName,
            slogan,
            logoImage
        });

        const savedProject = await newProject.save();

        res.json({ success: true, message: "Project Saved!", project: savedProject });

    } catch (error) {
        console.error("❌ Save Error:", error.message);
        res.status(500).json({ error: "Failed to save project", details: error.message });
    }
});

// ROUTE: Get all projects for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

module.exports = router; 