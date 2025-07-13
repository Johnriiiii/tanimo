const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const axios = require("axios");
const FormData = require("form-data");
const cloudinary = require("../config/cloudinary");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    // ✅ Upload image to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "uploads" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);
    console.log("✅ Cloudinary URL:", result.secure_url);

    // ✅ Download image as buffer again (optional but useful for form-data compatibility)
    const imageBuffer = (
      await axios.get(result.secure_url, { responseType: "arraybuffer" })
    ).data;

    // ✅ Create form-data to send to Hugging Face API
    const form = new FormData();
    form.append("file", Buffer.from(imageBuffer), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // ✅ Call the Hugging Face API
    const response = await axios.post(
      "https://premo625-plant-disease-api.hf.space/predict",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    res.json({ result: response.data });
  } catch (err) {
    console.error("❌ Error:", err);

    if (err.response) {
      console.error("📑 Hugging Face Response Error:", err.response.data);
      return res.status(err.response.status).json({
        message: "Hugging Face API error.",
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      return res.status(500).json({
        message: "Something went wrong.",
        error: err.message,
      });
    }
  }
});

module.exports = router;
