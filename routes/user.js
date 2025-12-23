const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project'); // Required to delete project data

// --- ROUTE 1: Get User Details (Load Settings Page) ---
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// --- ROUTE 2: Update Profile & Settings (Save Toggles) ---
router.put('/update', async (req, res) => {
    try {
        const { userId, notifications, twoFactor, username } = req.body;
        console.log(`⚙️ Updating Settings for User: ${userId}`);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                notifications, 
                twoFactor,
                username // Allows user to edit their display name
            },
            { new: true } // Returns the updated user object
        ).select('-password');

        res.json({ success: true, user: updatedUser, message: "Settings saved successfully!" });

    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(500).json({ error: "Update failed" });
    }
});

// --- ROUTE 3: Upgrade Plan (Billing Page) ---
router.post('/upgrade', async (req, res) => {
    try {
        const { userId, newPlan } = req.body;
        const validPlans = ['Free', 'Starter', 'Growth', 'Enterprise'];

        if (!validPlans.includes(newPlan)) {
            return res.status(400).json({ error: "Invalid Plan Selected" });
        }

        console.log(`💳 Upgrading User ${userId} to ${newPlan}...`);

        const user = await User.findByIdAndUpdate(
            userId, 
            { plan: newPlan }, 
            { new: true }
        ).select('-password');

        res.json({ success: true, message: `Plan upgraded to ${newPlan}!`, user });

    } catch (error) {
        console.error("Upgrade Error:", error.message);
        res.status(500).json({ error: "Upgrade failed" });
    }
});

// --- ROUTE 4: DANGER ZONE (Delete All Project Data) ---
router.delete('/delete-data', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(`⚠️ DELETING ALL DATA for User: ${userId}`);

        // Delete all projects created by this user
        const result = await Project.deleteMany({ userId: userId });

        console.log(`🗑️ Deleted ${result.deletedCount} projects.`);

        res.json({ 
            success: true, 
            message: `Successfully deleted ${result.deletedCount} projects.` 
        });

    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;