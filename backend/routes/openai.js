const express = require("express");
const authenticate = require("../middleware/auth");
const router = express.Router();
const upload = require("../config/multer");
const axios = require("axios");

// Create 
router.post("/", upload.single("image"), async(req,res) => {
    try{
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype; 

        const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
        const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What's in this image?" },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
          
    res.json({ result: response.data.choices[0].message.content });

    }catch(err) {
        console.log(err);
        res.status(500).json({ error: "Failed to analyze image." });    
    }
});

module.exports = router;
