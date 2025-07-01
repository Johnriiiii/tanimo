"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { showToast } from "../../utils/toast"
import API_BASE_URL from "../../utils/api"
import * as ImagePicker from "expo-image-picker"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

// User Type Selection Component
const UserTypeCard = ({ type, icon, title, description, selected, onPress, color }) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current
  const glowAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (selected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      glowAnimation.setValue(0)
    }
  }, [selected])

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.userTypeCardContainer}
    >
      <Animated.View
        style={[
          styles.userTypeCard,
          selected && styles.userTypeCardSelected,
          {
            transform: [{ scale: scaleAnimation }],
            borderColor: selected ? color : "#e0e0e0",
          },
        ]}
      >
        {selected && (
          <Animated.View
            style={[
              styles.selectedGlow,
              {
                opacity: glowOpacity,
                shadowColor: color,
              },
            ]}
          />
        )}

        <View style={[styles.userTypeIconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>

        <Text style={styles.userTypeTitle}>{title}</Text>
        <Text style={styles.userTypeDescription}>{description}</Text>

        {selected && (
          <View style={[styles.selectedBadge, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

// Animated Plant Growth Component
const PlantGrowth = ({ stage, style }) => {
  const growthAnimation = useRef(new Animated.Value(0)).current
  const leafAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(growthAnimation, {
        toValue: stage,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(leafAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [stage])

  const scaleInterpolate = growthAnimation.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0.3, 0.6, 0.8, 1],
  })

  const leafScale = leafAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleInterpolate }],
        },
      ]}
    >
      <View style={styles.plantStem}>
        <Ionicons name="remove" size={20} color="#16a34a" style={{ transform: [{ rotate: "90deg" }] }} />
      </View>
      <Animated.View
        style={{
          transform: [{ scale: leafScale }],
        }}
      >
        <Ionicons name="leaf" size={24} color="#22c55e" />
      </Animated.View>
    </Animated.View>
  )
}

// Floating Seed Animation
const FloatingSeed = ({ delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const rotateValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ),
        Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ),
      ]).start()
    }

    setTimeout(startAnimation, delay)
  }, [delay])

  const translateY = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  })

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Animated.View
      style={[
        styles.floatingSeed,
        {
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <Ionicons name="ellipse" size={8} color="#a3a3a3" />
    </Animated.View>
  )
}

// Enhanced Input Field with Plant Theme
const PlantInputField = ({
  name,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  focused,
  onFocus,
  onBlur,
}) => {
  const focusAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [focused])

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#22c55e"],
  })

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#f0fdf4"],
  })

  return (
    <Animated.View
      style={[
        styles.inputWrapper,
        {
          borderColor,
          backgroundColor,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color="#22c55e" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, isPassword && styles.passwordInput]}
        placeholder={placeholder}
        placeholderTextColor="#a0a0a0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onTogglePassword}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#22c55e" />
        </TouchableOpacity>
      )}
      {focused && (
        <View style={styles.growthIndicator}>
          <Ionicons name="leaf" size={12} color="#22c55e" />
        </View>
      )}
    </Animated.View>
  )
}

const RegisterDebug = ({ navigation }) => {
  // User Type Selection
  const [userType, setUserType] = useState("")

  // User Information
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [formProgress, setFormProgress] = useState(0)
  const [weatherMode, setWeatherMode] = useState("sunny")

  // Address Information
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    lastApiCall: null,
    lastResponse: null,
    formDataEntries: [],
  })

  // Animation refs
  const headerAnimation = useRef(new Animated.Value(0)).current
  const formAnimation = useRef(new Animated.Value(0)).current
  const progressAnimation = useRef(new Animated.Value(0)).current

  const userTypes = [

    {
      type: "gardener",
      icon: "leaf",
      title: "Professional Gardener",
      description: "I provide gardening services and expertise",
      color: "#3b82f6",
    },
    {
      type: "vendor",
      icon: "storefront",
      title: "Plant Vendor",
      description: "I sell plants, tools, and gardening supplies",
      color: "#f59e0b",
    },
  ]

  useEffect(() => {
    // Header entrance animation
    Animated.spring(headerAnimation, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start()

    // Form slide up animation
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start()

    // Calculate form progress
    const fields = [userType, name, email, password, confirmPassword, street, city, country]
    const filledFields = fields.filter((field) => field.trim() !== "").length
    const progress = filledFields / fields.length
    setFormProgress(progress)

    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()

    // Change weather mode periodically
    const weatherInterval = setInterval(() => {
      const modes = ["sunny", "rainy", "cloudy"]
      setWeatherMode(modes[Math.floor(Math.random() * modes.length)])
    }, 10000)

    return () => clearInterval(weatherInterval)
  }, [userType, name, email, password, confirmPassword, street, city, country])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      showToast("error", "Permission Denied", "Sorry, we need camera roll permissions to select an image")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const manipulatedImage = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 500, height: 500 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
      })
      setProfilePhoto(manipulatedImage)
      console.log("📸 Profile photo selected:", manipulatedImage.uri)
    }
  }

  const validateForm = () => {
    console.log("🔍 FORM VALIDATION START")
    console.log("Current userType:", userType)
    console.log("Form fields:", {
      userType,
      name: name.length,
      email: email.length,
      password: password.length,
      confirmPassword: confirmPassword.length,
      street: street.length,
      city: city.length,
      country: country.length,
    })

    if (!userType) {
      console.log("❌ Validation failed: No userType selected")
      showToast("error", "User Type Required", "Please choose your garden role first! 🌱")
      return false
    }

    if (!name || !email || !password || !confirmPassword) {
      console.log("❌ Validation failed: Missing required fields")
      showToast("error", "Missing Fields", "Please plant all the required seeds (fill required fields)")
      return false
    }

    if (password !== confirmPassword) {
      console.log("❌ Validation failed: Password mismatch")
      showToast("error", "Password Mismatch", "Your password seeds don't match!")
      return false
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      console.log("❌ Validation failed: Invalid email format")
      showToast("error", "Invalid Email", "Please enter a valid email address")
      return false
    }

    if (!street || !city || !country) {
      console.log("❌ Validation failed: Missing address fields")
      showToast("error", "Address Required", "Please provide your garden location (address)")
      return false
    }

    console.log("✅ Form validation passed!")
    return true
  }

  const handleRegister = async () => {
    console.log("🚀 REGISTRATION PROCESS STARTED")
    console.log("=".repeat(50))

    if (!validateForm()) {
      console.log("❌ Registration aborted: Form validation failed")
      return
    }

    setLoading(true)

    try {
      console.log("📋 PREPARING REGISTRATION DATA")
      console.log("Selected userType:", userType)
      console.log("User info:", { name, email: email.toLowerCase() })
      console.log("Address info:", { street, city, state, postalCode, country })
      console.log("Has profile photo:", !!profilePhoto)

      const formData = new FormData()

      // Add userType first for debugging
      formData.append("userType", userType)
      formData.append("name", name.trim())
      formData.append("email", email.toLowerCase().trim())
      formData.append("password", password)

      // Add address fields with the exact format the backend expects
      formData.append("address[street]", street.trim())
      formData.append("address[city]", city.trim())
      formData.append("address[state]", state.trim())
      formData.append("address[postalCode]", postalCode.trim())
      formData.append("address[country]", country.trim())

      if (profilePhoto) {
        formData.append("profilePhoto", {
          uri: profilePhoto.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        })
        console.log("📷 Profile photo added to FormData")
      }

      // Debug: Log FormData contents
      console.log("📦 FORMDATA CONTENTS:")
      const formDataEntries = []
      for (const [key, value] of formData.entries()) {
        const logValue = key === "password" ? "[HIDDEN]" : value
        console.log(`  ${key}:`, logValue)
        formDataEntries.push({ key, value: logValue })
      }

      setDebugInfo((prev) => ({
        ...prev,
        formDataEntries,
        lastApiCall: new Date().toISOString(),
      }))

      console.log("🌐 MAKING API REQUEST")
      console.log("API URL:", `${API_BASE_URL}/auth/register`)

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      })

      console.log("📡 RESPONSE RECEIVED")
      console.log("Status:", response.status)
      console.log("Status Text:", response.statusText)
      console.log("Headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("📄 RAW RESPONSE:")
      console.log(responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log("✅ JSON PARSED SUCCESSFULLY")
      } catch (e) {
        console.error("❌ JSON PARSE ERROR:", e)
        console.error("Response text that failed to parse:", responseText)
        setDebugInfo((prev) => ({
          ...prev,
          lastResponse: { error: "JSON Parse Failed", responseText },
        }))
        throw new Error("Invalid server response - not valid JSON")
      }

      console.log("📊 PARSED RESPONSE DATA:")
      console.log(JSON.stringify(data, null, 2))

      setDebugInfo((prev) => ({
        ...prev,
        lastResponse: data,
      }))

      if (!response.ok) {
        console.log("❌ HTTP ERROR:", response.status)
        console.log("Error message:", data.message)
        throw new Error(data.message || `HTTP ${response.status}: Registration failed`)
      }

      if (!data.success) {
        console.log("❌ API ERROR:", data.message)
        throw new Error(data.message || "Registration failed")
      }

      console.log("🎉 REGISTRATION SUCCESSFUL!")
      console.log("User created with userType:", data.user.userType)
      console.log("User ID:", data.user.id)
      console.log("Token received:", !!data.token)

      // Store user data
      await AsyncStorage.multiSet([
        ["userToken", data.token],
        ["userData", JSON.stringify(data.user)],
        ["isAuthenticated", "true"],
      ])

      console.log("💾 User data stored in AsyncStorage")

      const welcomeMessages = {
        user: "Welcome to your plant care journey! 🌱",
        gardener: "Welcome, professional gardener! Ready to help others grow? 🌿",
        vendor: "Welcome to the marketplace! Time to grow your business! 🏪",
      }

      const welcomeMessage = welcomeMessages[data.user.userType] || welcomeMessages.user

      showToast("success", "Welcome to the Garden!", welcomeMessage)

      console.log("🏠 NAVIGATING TO HOME")
      navigation.replace("Home")
    } catch (error) {
      console.error("💥 REGISTRATION ERROR:")
      console.error("Error type:", error.constructor.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)

      setDebugInfo((prev) => ({
        ...prev,
        lastResponse: { error: error.message, stack: error.stack },
      }))

      showToast("error", "Registration Failed", error.message || "Could not plant your account. Please try again.")
    } finally {
      setLoading(false)
      console.log("🏁 REGISTRATION PROCESS COMPLETED")
      console.log("=".repeat(50))
    }
  }

  const handleUserTypeSelection = (selectedType) => {
    console.log("👤 USER TYPE SELECTED:", selectedType)
    setUserType(selectedType)
  }

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const getWeatherGradient = () => {
    switch (weatherMode) {
      case "sunny":
        return ["#fbbf24", "#f59e0b", "#22c55e", "#16a34a"]
      case "rainy":
        return ["#60a5fa", "#3b82f6", "#22c55e", "#15803d"]
      case "cloudy":
        return ["#9ca3af", "#6b7280", "#22c55e", "#16a34a"]
      default:
        return ["#fbbf24", "#f59e0b", "#22c55e", "#16a34a"]
    }
  }

  const getPlantStage = () => {
    if (formProgress < 0.25) return 0
    if (formProgress < 0.5) return 1
    if (formProgress < 0.75) return 2
    return 3
  }

  const showDebugInfo = () => {
    Alert.alert(
      "Debug Information",
      `Last API Call: ${debugInfo.lastApiCall || "None"}\n\nFormData Entries: ${debugInfo.formDataEntries.length}\n\nLast Response: ${debugInfo.lastResponse ? "Available" : "None"}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View Details",
          onPress: () => {
            console.log("🐛 FULL DEBUG INFO:")
            console.log(JSON.stringify(debugInfo, null, 2))
          },
        },
      ],
    )
  }

  const headerScale = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const formTranslateY = formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  })

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={getWeatherGradient()} style={styles.gradientContainer}>
        {/* Floating Seeds */}
        {Array.from({ length: 6 }, (_, i) => (
          <FloatingSeed key={i} delay={i * 800} />
        ))}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                transform: [{ scale: headerScale }],
              },
            ]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Debug Button */}
              <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
                <Ionicons name="bug" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              <Image
                source={profilePhoto ? { uri: profilePhoto.uri } : require("../../assets/default-profile.png")}
                style={styles.profileImage}
              />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
              {/* Plant growth around profile */}
              <PlantGrowth stage={getPlantStage()} style={styles.plantGrowthLeft} />
              <PlantGrowth stage={getPlantStage()} style={styles.plantGrowthRight} />
            </TouchableOpacity>

            <Text style={styles.welcomeText}>Plant Your Roots</Text>
            <Text style={styles.subtitle}>Join our growing community</Text>

            {/* Growth Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Garden Progress</Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(formProgress * 100)}% Complete</Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: formTranslateY }],
                opacity: formAnimation,
              },
            ]}
          >
            {/* Debug Info Display */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🐛 Debug Info</Text>
              <Text style={styles.debugText}>Selected User Type: {userType || "None"}</Text>
              <Text style={styles.debugText}>Form Progress: {Math.round(formProgress * 100)}%</Text>
              <Text style={styles.debugText}>API Base URL: {API_BASE_URL}</Text>
              <Text style={styles.debugText}>
                Last API Call: {debugInfo.lastApiCall ? new Date(debugInfo.lastApiCall).toLocaleTimeString() : "None"}
              </Text>
            </View>

            {/* User Type Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={18} color="#22c55e" /> Choose Your Garden Role
              </Text>
              <Text style={styles.sectionSubtitle}>Select how you'd like to participate in our garden community</Text>

              <View style={styles.userTypeGrid}>
                {userTypes.map((type) => (
                  <UserTypeCard
                    key={type.type}
                    type={type.type}
                    icon={type.icon}
                    title={type.title}
                    description={type.description}
                    color={type.color}
                    selected={userType === type.type}
                    onPress={() => handleUserTypeSelection(type.type)}
                  />
                ))}
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={18} color="#22c55e" /> Plant Your Identity
              </Text>

              <PlantInputField
                name="name"
                icon="person-outline"
                placeholder="Full Name (Your Garden Name) *"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                focused={focusedInput === "name"}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="email"
                icon="mail-outline"
                placeholder="Email Address (Garden Contact) *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                focused={focusedInput === "email"}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="password"
                icon="lock-closed-outline"
                placeholder="Password (Garden Key) *"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                secureTextEntry={!showPassword}
                showPassword={showPassword}
                onTogglePassword={toggleShowPassword}
                focused={focusedInput === "password"}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />

              <PlantInputField
                name="confirmPassword"
                icon="lock-closed-outline"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword={true}
                secureTextEntry={!showConfirmPassword}
                showPassword={showConfirmPassword}
                onTogglePassword={toggleShowConfirmPassword}
                focused={focusedInput === "confirmPassword"}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Address Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color="#22c55e" /> Garden Location
              </Text>

              <PlantInputField
                name="street"
                icon="home-outline"
                placeholder="Street Address (Garden Address) *"
                value={street}
                onChangeText={setStreet}
                focused={focusedInput === "street"}
                onFocus={() => setFocusedInput("street")}
                onBlur={() => setFocusedInput(null)}
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="city"
                    icon="business-outline"
                    placeholder="City *"
                    value={city}
                    onChangeText={setCity}
                    focused={focusedInput === "city"}
                    onFocus={() => setFocusedInput("city")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="state"
                    icon="map-outline"
                    placeholder="State/Province"
                    value={state}
                    onChangeText={setState}
                    focused={focusedInput === "state"}
                    onFocus={() => setFocusedInput("state")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="postalCode"
                    icon="mail-outline"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    focused={focusedInput === "postalCode"}
                    onFocus={() => setFocusedInput("postalCode")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <PlantInputField
                    name="country"
                    icon="globe-outline"
                    placeholder="Country *"
                    value={country}
                    onChangeText={setCountry}
                    focused={focusedInput === "country"}
                    onFocus={() => setFocusedInput("country")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            {/* Plant Care Tip */}
            <View style={styles.tipContainer}>
              <Ionicons name="leaf" size={16} color="#22c55e" />
              <Text style={styles.tipText}>
                🌱 Welcome to your plant journey! Every great garden starts with choosing your role in the community.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a", "#15803d"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Plant My Garden</Text>
                    <Ionicons name="leaf" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already growing with us? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  floatingSeed: {
    position: "absolute",
    left: Math.random() * width,
    top: Math.random() * height * 0.3,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
    position: "relative",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  plantGrowthLeft: {
    position: "absolute",
    left: -30,
    top: 20,
  },
  plantGrowthRight: {
    position: "absolute",
    right: -30,
    top: 20,
  },
  plantStem: {
    alignItems: "center",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: "center",
    width: "80%",
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressPercentage: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 30,
  },
  debugContainer: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#1e40af",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 4,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  userTypeGrid: {
    gap: 15,
  },
  userTypeCardContainer: {
    marginBottom: 15,
  },
  userTypeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  userTypeCardSelected: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  userTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "center",
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  selectedBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 2,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#333",
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  growthIndicator: {
    position: "absolute",
    right: -8,
    top: "50%",
    marginTop: -6,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 2,
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    color: "#15803d",
    fontSize: 14,
  },
  registerButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    height: 56,
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: "#666",
    fontSize: 15,
  },
  loginText: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "600",
  },
})

export default RegisterDebug
