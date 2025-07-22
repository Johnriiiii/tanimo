const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cloudinary = require("cloudinary").v2
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
})

const upload = multer({ storage })

router.post("/register", upload.single("profilePhoto"), async (req, res) => {
  try {
    console.log("=== REGISTRATION DEBUG ===")
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    // Extract data from request body
    const { name, email, password, userType } = req.body

    // Handle nested address object from FormData
    // FormData sends nested objects as 'address[street]', 'address[city]', etc.
    const address = {
      street: req.body["address[street]"] || req.body.street || "",
      city: req.body["address[city]"] || req.body.city || "",
      state: req.body["address[state]"] || req.body.state || "",
      postalCode: req.body["address[postalCode]"] || req.body.postalCode || "",
      country: req.body["address[country]"] || req.body.country || "",
    }

    console.log("Extracted userType:", userType)
    console.log("Extracted address:", address)

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      })
    }

    // Validate userType
    const allowedUserTypes = ["user", "vendor", "gardener", "admin"]
    const finalUserType = userType || "user" // Default to 'user'

    if (!allowedUserTypes.includes(finalUserType)) {
      console.log("Invalid userType provided:", userType)
      return res.status(400).json({
        success: false,
        message: "Invalid user type. Must be one of: user, vendor, gardener, admin",
      })
    }

    console.log("Final userType to save:", finalUserType)

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType: finalUserType,
      address: address,
    }

    // Add profile photo if uploaded
    if (req.file) {
      userData.profilePhoto = req.file.path
      console.log("Profile photo uploaded:", req.file.path)
    }

    console.log("Creating user with data:", {
      ...userData,
      password: "[HIDDEN]", // Don't log the password
    })

    // Create user
    const user = await User.create(userData)
    console.log("User created successfully:", {
      id: user._id,
      userType: user.userType,
      email: user.email,
    })

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        userType: user.userType,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }, // Extended to 7 days
    )

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto || null,
        address: user.address,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===")
    console.log("Login request body:", req.body)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      console.log("User not found for email:", email)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // 🚫 Check if user is deactivated
    if (user.status === "deactivated") {
      console.log("User is deactivated:", email)
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        userType: user.userType,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log("Login successful for user:", {
      id: user._id,
      userType: user.userType,
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto || null,
        address: user.address,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})
// Add a test endpoint to verify userType handling
router.get("/test-user-types", async (req, res) => {
  try {
    const users = await User.find({}, "name email userType").limit(10)
    res.json({
      success: true,
      users: users,
      allowedTypes: [ "vendor", "gardener", "admin"]
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
