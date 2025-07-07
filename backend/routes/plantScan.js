const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');  // Make sure this is at the top

// Configure upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/analyze', upload.single('image'), async (req, res) => {
    let tempFilePath = req.file?.path;
    
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No image uploaded'
            });
        }

        console.log('Processing image:', tempFilePath);
        
        // Load image with Jimp
        const image = await Jimp.read(tempFilePath);
        
        // Resize for processing
        image.resize(300, Jimp.AUTO);
        
        // Get basic color analysis
        const { green, yellow, brown } = await analyzeColors(image);
        
        // Determine results
        const healthStatus = determineHealth(green, brown);
        const harvestStatus = determineHarvest(green, yellow, brown);

        res.json({
            status: 'success',
            analysis: {
                healthStatus,
                harvestStatus,
                colorAnalysis: {
                    green: `${green.toFixed(1)}%`,
                    yellow: `${yellow.toFixed(1)}%`,
                    brown: `${brown.toFixed(1)}%`
                }
            }
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to analyze image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Clean up temp file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});

// Color analysis function
async function analyzeColors(image) {
    let green = 0, yellow = 0, brown = 0, total = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const red = image.bitmap.data[idx + 0];
        const greenVal = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];
        
        // Simple color classification
        if (greenVal > red * 1.2 && greenVal > blue * 1.2) green++;
        else if (red > greenVal * 1.3 && blue < greenVal * 0.7) brown++;
        else if (Math.abs(red - greenVal) < 30 && red > blue * 1.2) yellow++;
        
        total++;
    });

    return {
        green: (green / total) * 100,
        yellow: (yellow / total) * 100,
        brown: (brown / total) * 100
    };
}

function determineHealth(green, brown) {
    if (brown > 20) return { status: "Unhealthy", confidence: "High" };
    if (green > 60) return { status: "Healthy", confidence: "High" };
    if (green > 40) return { status: "Moderately Healthy", confidence: "Medium" };
    return { status: "Potentially Unhealthy", confidence: "Medium" };
}

function determineHarvest(green, yellow, brown) {
    if (brown > 15) return { status: "Overripe", recommendation: "Harvest immediately" };
    if (yellow > 20) return { status: "Ready to Harvest", recommendation: "Good time to harvest" };
    if (green > 70) return { status: "Not Ready", recommendation: "Wait longer" };
    return { status: "Almost Ready", recommendation: "Check again in a few days" };
}

module.exports = router;